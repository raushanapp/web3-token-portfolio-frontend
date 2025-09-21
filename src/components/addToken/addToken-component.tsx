import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import TokenSearch from './tokenSearch-component';
import TrendingTokens from './trendingToken-component';

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTokenModal: React.FC<AddTokenModalProps> = ({ isOpen, onClose }) => {
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTokens(new Set());
    }
  }, [isOpen]);

  const handleTokenSelect = (tokenId: string, isSelected: boolean) => {
    const newSelected = new Set(selectedTokens);
    if (isSelected) {
      newSelected.add(tokenId);
    } else {
      newSelected.delete(tokenId);
    }
    setSelectedTokens(newSelected);
  };

  const handleAddToWatchlist = async () => {
    if (selectedTokens.size === 0) return;
    
    setIsAdding(true);
    try {
    //   await dispatch(addTokensToWatchlist(Array.from(selectedTokens))).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to add tokens:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-overlay fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="modal-content w-full max-w-2xl transform overflow-hidden transition-all">
                {/* Header */}
                <div className="px-6 py-4" style={{ 
                  borderBottom: '1px solid var(--color-border-primary)',
                  backgroundColor: 'var(--color-background-secondary)'
                }}>
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold" 
                                  style={{ color: 'var(--color-text-primary)' }}>
                      Add Tokens to Watchlist
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      style={{ color: 'var(--color-text-tertiary)' }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto" 
                     style={{ backgroundColor: 'var(--color-background-secondary)' }}>
                  <TokenSearch
                    selectedTokens={selectedTokens}
                    onTokenSelect={handleTokenSelect}
                  />

                  <TrendingTokens
                    selectedTokens={selectedTokens}
                    onTokenSelect={handleTokenSelect}
                  />
                </div>

                {/* Footer */}
                <div className="px-6 py-4" style={{ 
                  borderTop: '1px solid var(--color-border-primary)',
                  backgroundColor: 'var(--color-background-tertiary)'
                }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {selectedTokens.size} token{selectedTokens.size !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isAdding}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddToWatchlist}
                        disabled={selectedTokens.size === 0 || isAdding}
                        className="btn-portfolio-primary flex items-center gap-2"
                      >
                        {isAdding && (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                        {isAdding ? 'Adding...' : 'Add to Watchlist'}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddTokenModal;
