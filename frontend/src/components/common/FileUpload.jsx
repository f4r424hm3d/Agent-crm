import React, { useState, useRef } from "react";
import { FiUpload, FiFile, FiX } from "react-icons/fi";

const FileUpload = ({
  label,
  name,
  accept,
  multiple = false,
  onChange,
  error,
  required = false,
  maxSize = 5, // MB
  className = "",
}) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Validate file size
    const validFiles = selectedFiles.filter((file) => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSize) {
        alert(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
        return false;
      }
      return true;
    });

    setFiles(validFiles);
    onChange && onChange(multiple ? validFiles : validFiles[0]);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange && onChange(multiple ? newFiles : newFiles[0] || null);
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />

        <p className="text-sm text-gray-600 mb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Click to upload
          </button>{" "}
          or drag and drop
        </p>

        <p className="text-xs text-gray-500">Maximum file size: {maxSize}MB</p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FiFile className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-700"
              >
                <FiX size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default FileUpload;
