import { useState, useRef } from 'react';
import {
  ALLOWED_TYPES,
  TXT_MAX_SIZE,
} from '../../../config/file.config';
import { uploadFile } from '../../../services';

export default function useFileUpload(initialPaths?: string[]) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [keptFilePaths, setKeptFilePaths] = useState<string[]>(initialPaths ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!(ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      return 'Недопустимый тип файла. Разрешены: txt, jpg, gif, png';
    }
    if (file.type === 'text/plain' && file.size > TXT_MAX_SIZE) {
      return 'Размер txt-файла не должен превышать 100 КБ';
    }
    return null;
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    if (newFiles.length === 0) return;

    const errors: string[] = [];
    const valid: File[] = [];

    for (const f of newFiles) {
      const err = validateFile(f);
      if (err) {
        errors.push(`${f.name}: ${err}`);
      } else {
        valid.push(f);
      }
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
    setFileErrors((prev) => [...prev, ...errors]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeKeptFile = (path: string) => {
    setKeptFilePaths((prev) => prev.filter((p) => p !== path));
  };

  const uploadSelected = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];
    const results = await Promise.all(selectedFiles.map((f) => uploadFile(f)));
    return results.map((r) => r.path);
  };

  return {
    selectedFiles,
    fileErrors,
    keptFilePaths,
    fileInputRef,
    addFiles,
    removeFile,
    removeKeptFile,
    uploadSelected,
  };
}
