import JSZip from 'jszip';
import { generateFacilitationSheetPdf } from './facilitationSheetPdfGenerator';
import { generateWallMatrixPdf } from './groupMatrixPdfGenerator';
import { generateBinomesGuidePdf } from './groupBinomesPdfGenerator';

/**
 * Bundles the 3 group kit PDFs into a single ZIP file and triggers instant download
 */
export async function downloadGroupKitZip(): Promise<void> {
  const zip = new JSZip();

  // Generate binary buffers from jsPDF
  const sheetPdf = generateFacilitationSheetPdf().output('arraybuffer');
  const matrixPdf = generateWallMatrixPdf().output('arraybuffer');
  const binomesDoc = await generateBinomesGuidePdf();
  const binomesPdf = binomesDoc.output('arraybuffer');

  zip.file('01_Fiche_Animation_Rencontre_45min.pdf', sheetPdf);
  zip.file('02_Matrice_Murale_Cartographie_A3.pdf', matrixPdf);
  zip.file('03_Guide_Binomes_et_Frictions_Fraternelles.pdf', binomesPdf);

  const blob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Kit-Animation-Groupes-Disciple.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
