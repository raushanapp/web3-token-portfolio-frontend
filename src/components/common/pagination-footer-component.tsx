import React from 'react';
interface PaginationFooterProps {
  currentPage: number;
  totalItems: number;
  onPageChange: (pageArrow: string, currentPage: number) => void;
  itemsPerPage?: number;
}

export const PaginationFooter: React.FC<PaginationFooterProps> = ({ 
  currentPage, 
  totalItems, 
  onPageChange,
  itemsPerPage = 10 // Default value here, not in destructuring above
}) => {
    // Calculate total pages correctly
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Don't show pagination if only 1 page or no items
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-end items-center gap-4">

      <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {/* Fix: Show currentPage of totalPages, not totalItems */}
        <span>{currentPage} of {totalPages} pages</span>
        
        <button
          onClick={() => onPageChange("left", currentPage)}
          disabled={currentPage === 1} // Correct: disable when on first page
          className="ml-4 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: 'var(--color-background-tertiary)',
            color: 'var(--color-text-primary)'
          }}
        >
          Prev
        </button>
        
        <button
          onClick={() => onPageChange("right", currentPage)}
          disabled={currentPage === totalPages} // Fix: disable when on last page, not totalItems
          className="ml-2 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: 'var(--color-background-tertiary)',
            color: 'var(--color-text-primary)'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

