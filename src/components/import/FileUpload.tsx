import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { ParsedEntry } from './types';
import { parseCSV } from './parseCSV';

interface FileUploadProps {
  onParsed: (entries: ParsedEntry[], filename: string, size: number, skippedCount: number, rawContent: string) => void;
  selectedYear: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onParsed, selectedYear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }
    const text = await file.text();
    const rowsCount = text.split('\n').filter(r => r.trim()).length - 1; // -1 for header
    const entries = parseCSV(text, selectedYear);
    const skipped = Math.max(0, rowsCount - entries.length);
    onParsed(entries, file.name, file.size, skipped, text);
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
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/50'
      }`}
    >
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <div className="flex flex-col items-center gap-3">
        <UploadCloud size={40} className="text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">Drop your CSV file here or click to browse</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Export from Google Sheets: File → Download → Comma Separated Values (.csv)
          </p>
        </div>
      </div>
    </div>
  );
};
