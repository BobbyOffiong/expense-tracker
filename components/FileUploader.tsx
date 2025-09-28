import React from 'react';

interface FileUploaderProps {
  onFileUploaded: (file: File) => void;
  uploadedFile: File | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded, uploadedFile }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUploaded(file);
    }
  };

  return (
    <div className="mb-4 overflow-x-hidden">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center">Upload Statement</h2>
      <label
        htmlFor="file-upload"
        className="block cursor-pointer px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#046A38] transition-colors duration-200"
      >
        {uploadedFile ? uploadedFile.name : 'Choose file to upload'}
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default FileUploader;