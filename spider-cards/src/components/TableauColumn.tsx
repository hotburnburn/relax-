import React, { useState } from 'react';
import type { Card } from '../types/game';
import { CardView } from './CardView';
import { canSelectCard, isValidMove } from '../utils/gameLogic';
import './TableauColumn.css';


interface TableauColumnProps {
  cards: Card[];
  colIndex: number;
  selectedCard: { colIndex: number; cardIndex: number } | null;
  hintedCard: { fromCol: number; cardIndex: number; toCol: number } | null;
  draggedStack: { colIndex: number; cardIndex: number } | null;
  allTableaus: Card[][]; // Needed to validate drag-over in real-time
  onSelectCard: (colIndex: number, cardIndex: number, event: React.MouseEvent) => void;
  onDropCards: (fromColIndex: number, fromCardIndex: number, toColIndex: number) => void;
  onDragStartGlobal: (colIndex: number, cardIndex: number) => void;
  onDragEndGlobal: () => void;
}

export const TableauColumn: React.FC<TableauColumnProps> = ({
  cards,
  colIndex,
  selectedCard,
  hintedCard,
  draggedStack,
  allTableaus,
  onSelectCard,
  onDropCards,
  onDragStartGlobal,
  onDragEndGlobal
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Check if the currently dragged stack can be dropped on this column
  const canAcceptDraggedStack = (): boolean => {
    if (!draggedStack) return false;
    if (draggedStack.colIndex === colIndex) return false; // Can't drop on itself

    const sourceColumn = allTableaus[draggedStack.colIndex];
    const movingStack = sourceColumn.slice(draggedStack.cardIndex);
    
    return isValidMove(movingStack, cards);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (canAcceptDraggedStack()) {
      e.preventDefault(); // Allows dropping
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { colIndex: fromCol, cardIndex: fromCard } = JSON.parse(dataStr);
      onDropCards(fromCol, fromCard, colIndex);
    } catch (err) {
      console.error('Error in drop handler:', err);
    }
  };

  const handleDragStart = (cardIndex: number) => {
    onDragStartGlobal(colIndex, cardIndex);
  };

  // Click on the empty column space to move selected card here
  const handleColumnClick = (e: React.MouseEvent) => {
    if (cards.length === 0) {
      // Pass cardIndex = -1 to represent clicking an empty column
      onSelectCard(colIndex, -1, e);
    }
  };

  // Recursively render the stacked cards
  const renderCardStack = (index: number): React.ReactNode => {
    if (index >= cards.length) return null;
    const card = cards[index];

    const isSelected = !!selectedCard && 
      selectedCard.colIndex === colIndex && 
      selectedCard.cardIndex === index;

    const isDraggable = canSelectCard(cards, index);

    const isHinted = !!hintedCard && 
      hintedCard.fromCol === colIndex && 
      hintedCard.cardIndex === index;

    return (
      <CardView
        card={card}
        colIndex={colIndex}
        cardIndex={index}
        isSelected={isSelected}
        isHinted={isHinted}
        isDraggable={isDraggable}
        onSelect={onSelectCard}
        onDragStart={() => handleDragStart(index)}
        onDragEnd={onDragEndGlobal}
      >
        {renderCardStack(index + 1)}
      </CardView>
    );
  };

  const isValidDrop = draggedStack ? canAcceptDraggedStack() : false;
  const columnClasses = [
    'tableau-column',
    cards.length === 0 ? 'empty-column' : '',
    isDragOver && isValidDrop ? 'drag-hover-valid' : '',
    // If we have a selected card that can move here, highlight the empty column or destination
    selectedCard && selectedCard.colIndex !== colIndex && isValidMove(allTableaus[selectedCard.colIndex].slice(selectedCard.cardIndex), cards) ? 'valid-target-highlight' : ''
  ].join(' ');

  return (
    <div
      className={columnClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleColumnClick}
    >
      {cards.length > 0 ? (
        renderCardStack(0)
      ) : (
        // Placeholder for empty column
        <div className="empty-column-slot">
          <svg viewBox="0 0 24 24" className="empty-slot-icon">
            <path fill="currentColor" d="M19 13H5v-2h14v2Z" opacity="0.3" />
          </svg>
        </div>
      )}
    </div>
  );
};
