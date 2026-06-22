import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RawRow } from './rowMapping';
import { parseCSVToRows } from './parseCSV';
import { parseExcelToRows } from './parseExcel';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface FileUploadProps {
  onParsed: (rows: RawRow[], filename: string, size: number) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isCsv = lowerName.endsWith('.csv');
    const isExcel = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');

    if (!isCsv && !isExcel) {
      toast.error('Unsupported file type. Please upload a .csv, .xlsx, or .xls file.');
      return;
    }

    if (file.size === 0) {
      toast.error('That file is empty.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('File is too large (max 10 MB). Try splitting it into smaller exports.');
      return;
    }

    setIsReading(true);
    try {
      const rows = isCsv
        ? parseCSVToRows(await file.text())
        : await parseExcelToRows(file);

      if (rows.length < 2) {
        toast.error('No data rows found. Make sure the file has a header row plus at least one entry.');
        return;
      }

      onParsed(rows, file.name, file.size);
    } catch (err) {
      console.error('Failed to read file:', err);
      toast.error(
        isExcel
          ? "Could not read this Excel file — it may be corrupted or in an unsupported format."
          : "Could not read this CSV file. Check that it's plain text and try again."
      );
    } finally {
      setIsReading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !isReading && fileInputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload a CSV or Excel file with your journal data"
      onKeyDown={(e) => {
        if (!isReading && (e.key === 'Enter' || e.key === ' ')) fileInputRef.current?.click();
      }}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/50'
      } ${isReading ? 'pointer-events-none opacity-70' : ''}`}
    >
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <div className="flex flex-col items-center gap-3">
        {isReading ? (
          <Loader2 size={40} className="text-primary animate-spin" />
        ) : (
          <UploadCloud size={40} className="text-primary" />
        )}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {isReading ? 'Reading file…' : 'Drop your CSV or Excel file here or click to browse'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Supports .csv, .xlsx and .xls — export from Google Sheets, Excel, or Numbers
          </p>
        </div>
      </div>
    </div>
  );
};
