import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const renderPageNumbers = () => {
    const pages = [];

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-gray-500 hover:text-gray-700 flex items-center"
      >
        {" "}
        <ChevronLeft className="w-4 h-4 mr-1" />
      </button>
    );

    // Page numbers

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-gray-500 hover:text-gray-700 flex items-center"
      >
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    );

    return pages;
  };

  return (
    <div className="flex items-center justify-center mt-8 mb-4">
      {renderPageNumbers()}
    </div>
  );
};

export default Pagination;
