"use client";

import React, { useState, useEffect, useRef, JSX } from "react";
import { SecureNote, UploadCard } from "@/components/tools/upload-card";
import { FileText, Trash2, RotateCw, Download, Loader2 } from "lucide-react";
import { errorName } from "@/lib/errors";
// Type-only, so it adds nothing to the bundle — the library itself still
// arrives through the dynamic import below.
import type * as PdfjsLib from "pdfjs-dist";
import { downloadBlob } from "@/lib/download";
import { useCancellableRun, wasCancelled } from "@/hooks/useCancellableRun";

export default function RotatePdfPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const { begin, cancel } = useCancellableRun();
  const [pdfDoc, setPdfDoc] = useState<PdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  /**
   * Angles set on individual pages, keyed by 1-based page number.
   *
   * A page is only in here once it has been turned on its own. Everything else
   * follows the document-wide angle above, so the common case — turn the whole
   * thing — needs no per-page entries at all.
   */
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});

  const [loading, setLoading] = useState<boolean>(false);
  const [libLoading, setLibLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<typeof PdfjsLib | null>(null);

  const canvasRefs = useRef<{ [key: number]: HTMLCanvasElement | null }>({});

  useEffect(() => {
    let isMounted = true;
    import("pdfjs-dist")
      .then((lib) => {
        if (!isMounted) return;
        if (typeof window !== "undefined") {
          lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`;
        }
        setPdfjsLib(lib);
        setLibLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load pdfjs:", err);
        if (isMounted) {
          setError("Failed to load PDF engine.");
          setLibLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = async (fileList: FileList | null): Promise<void> => {
    if (fileList && fileList[0]) {
      const selectedFile = fileList[0];
      if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".pdf")) {
        setFile(selectedFile);
        setPageRotations({});
        setError(null);

        if (!pdfjsLib) {
          setError("PDF engine is still initializing. Please wait and re-upload.");
          return;
        }

        try {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            useWorkerFetch: false,
            isEvalSupported: false,
            disableFontFace: true,
          });

          const loadedPdf = await loadingTask.promise;

          if (!loadedPdf || loadedPdf.numPages === 0) {
            throw new Error("No pages found in this PDF.");
          }

          setPdfDoc(loadedPdf);
          setNumPages(loadedPdf.numPages);
        } catch (err) {
      if (wasCancelled(err)) return;
          console.error("PDF parse error:", err);

          if (errorName(err) === "PasswordException") {
            setError("This PDF is password-protected. Please provide an unprotected file.");
          } else {
            setError("Could not read PDF structure. Ensure the file is a valid, uncorrupted PDF.");
          }

          setPdfDoc(null);
          setNumPages(0);
        }
      } else {
        setError("Please upload a valid PDF document.");
      }
    }
  };

  const handleClearFile = (): void => {
    // Removing the file stops whatever it was being used for.
    cancel();
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setPageRotations({});
    setError(null);
  };



  /**
   * A quarter turn on one page, from its own icon.
   *
   * Starts from whatever that page is showing — its own angle if it has one,
   * otherwise the document-wide one — so the first click continues from what is
   * on screen rather than jumping back to zero first.
   */
  const turnPage = (pageNum: number): void => {
    setPageRotations((prev) => ({ ...prev, [pageNum]: ((prev[pageNum] ?? 0) + 90) % 360 }));
  };

  /** What a given page is showing. Untouched pages are simply not in the map. */
  const angleFor = (pageNum: number): number => pageRotations[pageNum] ?? 0;

  /** True once any page has been turned on its own. */
  const hasPerPage = Object.values(pageRotations).some((a) => a !== 0);

  useEffect(() => {
    if (!pdfDoc || numPages === 0) return;

    let isMounted = true;

    const renderPages = async (): Promise<void> => {
      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdfDoc.getPage(i);
          const canvas = canvasRefs.current[i];
          if (!canvas || !isMounted) continue;

          const context = canvas.getContext("2d");
          if (!context) continue;

          const viewport = page.getViewport({ scale: 1.0 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          const renderTask = page.render(renderContext);
          await renderTask.promise;
        } catch (err) {
      if (wasCancelled(err)) return;
          console.error(`Error rendering page ${i}:`, err);
        }
      }
    };

    renderPages();

    return () => {
      isMounted = false;
    };
  }, [pdfDoc, numPages]);

  const handleRotateAndDownload = async (): Promise<void> => {
    const signal = begin();
    if (!file) return;


    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

        // Send exactly what the preview shows: every page's own angle, taken
      // from angleFor so a page that was never touched still carries the
      // document-wide turn rather than silently coming back upright.
      const angles: Record<number, number> = {};
      for (let page = 1; page <= numPages; page++) {
        const angle = angleFor(page);
        if (angle !== 0) angles[page] = angle;
      }
      formData.append("rotations", JSON.stringify(angles));

      const res = await fetch("/api/rotate-pdf", {
        method: "POST",
        body: formData, signal });

      if (!res.ok) {
        let errorMessage = "Rotation failed.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch { }
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      downloadBlob(blob, `${file.name.replace(/\.[^/.]+$/, "")}_rotated.pdf`);
    } catch (err: unknown) {
      if (wasCancelled(err, signal)) return;
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during rotation.");
      }
    } finally {
      setLoading(false);
    }
  };

  // A quarter turn swaps the page's width and height, but the canvas box is
  // measured before the transform, so a sideways page needs clamping on the
  // opposite axis or it spills out of its frame.
  const isQuarterTurn = (deg: number) => deg % 180 !== 0;

  return (
    <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
      {/* Header — same pattern as the other tool pages */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-card border border-card flex items-center justify-center mb-3 text-fg shadow-sm">
          <RotateCw className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-fg tracking-tight px-2">
          Rotate PDF Pages
        </h1>
        <p className="text-muted text-[13px] sm:text-sm mt-1.5 max-w-xs sm:max-w-lg mx-auto leading-relaxed">
          Rotate your entire document or target a single specific page cleanly.
        </p>
      </div>

      {libLoading ? (
        <div className="border-2 border-dashed border-card rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center bg-[var(--background-secondary)] gap-3">
          <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-fg animate-spin" />
          <span className="text-[13px] sm:text-sm text-muted font-medium">Initializing PDF engine...</span>
        </div>
      ) : !file ? (
        <UploadCard onFiles={handleFileChange} title="Click to browse or drag & drop a PDF" hint="PDF documents" />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* File summary */}
          <div className="bg-card border border-card rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-card border border-card flex items-center justify-center text-fg shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-fg text-[13px] sm:text-sm font-bold truncate">{file.name}</p>
                <p className="text-[11px] sm:text-xs text-muted mt-0.5 truncate">
                  Size: <strong className="text-fg">{(file.size / (1024 * 1024)).toFixed(2)} MB</strong> •{" "}
                  {numPages} {numPages === 1 ? "Page" : "Pages"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              className="p-2 sm:p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors shrink-0"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {/* The whole-document controls are gone: every page carries its own
              rotate icon in the preview below, which covers turning one page and
              turning all of them without a second way to say it. */}
          {/* Page preview */}
          {numPages > 0 && (
            <div className="bg-card border border-card rounded-2xl p-3 sm:p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 pb-2 mb-3 border-b border-card">
                <span className="text-[10px] sm:text-xs font-extrabold text-fg uppercase tracking-wider">
                  Page Preview ({numPages} Total)
                </span>
                <button
                  type="button"
                  onClick={() => setPageRotations({})}
                  disabled={!hasPerPage}
                  className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-md bg-card border border-card text-muted hover:text-fg disabled:opacity-40 disabled:hover:text-muted shrink-0 transition-colors"
                >
                  Reset all
                </button>
              </div>

              <div className="w-full max-h-[340px] sm:max-h-[420px] overflow-y-auto space-y-3 sm:space-y-4 pr-1">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => {
                  const currentDegrees = angleFor(pageNum);
                  const ownAngle = pageRotations[pageNum] !== undefined;

                  return (
                    <div
                      key={pageNum}
                      className="bg-[var(--background-secondary)] border border-card rounded-xl p-2.5 sm:p-3 flex flex-col items-center"
                    >
                      <div className="w-full flex justify-between items-center gap-2 mb-2 text-[11px] text-muted px-1">
                        <span className="font-semibold truncate">
                          Page {pageNum} of {numPages}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-2 py-0.5 rounded font-mono border ${ownAngle
                            ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]"
                            : "bg-card border-card text-fg"
                            }`}>
                            {currentDegrees}°
                          </span>

                          {/* Turns this page alone. Once used, the page keeps its
                              own angle and stops following the document-wide
                              buttons — which is the point of turning it. */}
                          <button
                            type="button"
                            onClick={() => turnPage(pageNum)}
                            aria-label={`Rotate page ${pageNum} right 90 degrees`}
                            title={`Rotate page ${pageNum}`}
                            className="h-7 w-7 flex items-center justify-center rounded-md border border-card bg-card text-fg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full h-56 sm:h-80 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-black/60 rounded-lg p-2">
                        <canvas
                          ref={(el) => {
                            canvasRefs.current[pageNum] = el;
                          }}
                          className={`object-contain origin-center shadow-md ${isQuarterTurn(currentDegrees)
                            ? "max-h-full max-w-[13rem] sm:max-w-[19rem]"
                            : "max-h-full max-w-full"
                            }`}
                          style={{
                            transform: `rotate(${currentDegrees}deg)`,
                            transition: "transform 0.3s ease-in-out",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted mt-3 text-center">Scroll to inspect every page.</p>
            </div>
          )}

          {error && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[13px] sm:text-sm font-semibold text-center">
              {error}
            </div>
          )}

          {/* Nothing to save at 0°: the file would come back byte-for-byte as it
              went out, having spent one of the day's operations to do it. */}
          <button
            type="button"
            onClick={handleRotateAndDownload}
            disabled={loading || !hasPerPage}
            className="w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-[13px] sm:text-base shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 transition-all hover:bg-slate-800 dark:hover:bg-zinc-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            ) : (
              <Download className="w-5 h-5 shrink-0" />
            )}
            <span>
              {loading
                ? "Processing document..."
                : !hasPerPage
                  ? "Turn a page to save it"
                  : "Save & Download PDF"}
            </span>
          </button>
        </div>
      )}

      {/* Errors before a file is chosen still need somewhere to show */}
      {error && !file && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[13px] font-semibold text-center">
          {error}
        </div>
      )}

      <SecureNote />
    </div>
  );
}