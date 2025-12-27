
import os

new_code = r"""function renderImportReview() {
    importReviewSection.classList.remove('hidden');
    importReviewList.innerHTML = '';
    saveImportBtn.classList.remove('hidden');
    saveImportBtn.disabled = false;
    saveImportBtn.textContent = 'Save Selected';

    // STABLE LAYOUT: Fixed large width, no jumping
    const modalContainer = document.querySelector('#import-modal > div');
    modalContainer.classList.remove('max-w-lg');
    modalContainer.classList.add('w-11/12', 'max-w-6xl', 'h-[90vh]', 'flex', 'flex-col');

    // Make the review list scrollable
    importReviewList.className = 'flex-grow overflow-y-auto px-4 min-h-0 space-y-4 pb-8';
    importReviewSection.classList.remove('hidden');
    importReviewSection.classList.add('flex', 'flex-col', 'h-full', 'min-h-0');

    // 1. Render Candidates (Things needing review)
    importCandidates.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'bg-white p-3 rounded-lg border border-stone-200 shadow-sm';

        // Header: Compact
        wrapper.innerHTML = `
            <div class="flex justify-between items-center mb-2 border-b border-stone-100 pb-2">
                <div class="flex items-baseline gap-2 overflow-hidden">
                    <span class="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex-shrink-0">Query</span>
                    <span class="font-serif font-bold text-stone-800 text-base truncate" title="${item.query}">"${item.query}"</span>
                </div>
                <button onclick="(() => { importCandidates[${importCandidates.indexOf(item)}].selectedId = null; renderImportReview(); })()" 
                    class="text-[10px] flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-100 transition font-medium">
                    Skip
                </button>
            </div>
        `;

        const selectionContainer = document.createElement('div');
        // COMPACT GRID LAYOUT: 2 Columns
        selectionContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-2 auto-rows-fr'; 

        if (item.results.length === 0) {
            selectionContainer.innerHTML = '<p class="text-xs text-red-500 italic p-2 col-span-full">No matches found.</p>';
        } else {
            item.results.forEach(book => {
                const div = document.createElement('div');
                const isSelected = item.selectedId === book.id;
                
                // Card Style: Horizontal, Small, Compact
                div.className = `flex gap-2 p-2 rounded border cursor-pointer transition-all h-full items-center ${isSelected ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500' : 'border-stone-100 hover:border-stone-300 hover:bg-stone-50'}`;
                
                div.onclick = () => {
                    item.selectedId = (item.selectedId === book.id) ? null : book.id;
                    renderImportReview();
                };

                const thumb = book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/60x90?text=No+Img';
                // Remove curl edge for cleaner look
                const cleanThumb = thumb.replace('&edge=curl', '').replace('http:', 'https:');
                const authors = book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Unknown';
                const year = book.volumeInfo.publishedDate ? book.volumeInfo.publishedDate.substring(0, 4) : '';

                div.innerHTML = `
                    <div class="flex-shrink-0 w-10 h-14 bg-stone-100 border border-stone-200 overflow-hidden rounded-sm self-center">
                         <img src="${cleanThumb}" class="w-full h-full object-cover">
                    </div>
                    <div class="min-w-0 flex-grow flex flex-col justify-center h-full">
                        <h4 class="font-semibold text-stone-800 text-xs leading-snug mb-0.5 line-clamp-2" title="${book.volumeInfo.title}">${book.volumeInfo.title}</h4>
                        <p class="text-[10px] text-stone-500 line-clamp-1">${authors} ${year ? `• ${year}` : ''}</p>
                    </div>
                    ${isSelected ? '<div class="flex-shrink-0 text-green-500 self-center pl-2"><iconify-icon icon="solar:check-circle-bold" class="text-lg"></iconify-icon></div>' : ''}
                `;
                selectionContainer.appendChild(div);
            });
        }
        
        wrapper.appendChild(selectionContainer);
        importReviewList.appendChild(wrapper);
    });

    // 2. Render Auto-Imported Matches (Optional Grid at bottom)
    if (autoImported.length > 0) {
        const gridHeader = document.createElement('div');
        gridHeader.className = 'flex items-center justify-between mb-4 mt-8 px-1 border-t border-stone-200 pt-6';
        gridHeader.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <iconify-icon icon="solar:magic-stick-3-bold-duotone" class="text-lg"></iconify-icon>
                </div>
                <div>
                     <h4 class="font-bold text-stone-800 text-lg">Auto-Matched Books</h4>
                     <p class="text-xs text-stone-500">High confidence matches (${autoImported.length})</p>
                </div>
            </div>
         `;
        importReviewList.appendChild(gridHeader);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6';

        autoImported.forEach((book, index) => {
            // Simplified for this replacement to avoid huge block, but we need it.
            // I'll reuse the existing grid logic structure but keep it clean.
            const info = book.volumeInfo;
            const card = document.createElement('div');
            card.className = "group relative flex flex-col gap-3 rounded-xl p-2 bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors";

            const thumb = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Img';

            card.innerHTML = `
                 <div class="absolute top-2 right-2 z-10">
                     <button onclick="removeAutoImport(${index})" class="bg-white/90 text-stone-400 hover:text-red-500 rounded-full p-1 shadow-sm border border-stone-200 transition-colors">
                        <iconify-icon icon="solar:trash-bin-trash-bold" class="text-base"></iconify-icon>
                     </button>
                 </div>
                 <div class="w-full aspect-[2/3] bg-stone-200 rounded shadow-sm overflow-hidden border border-stone-200">
                     <img src="${thumb.replace('http:', 'https:')}" class="w-full h-full object-cover">
                 </div>
                 <div>
                     <p class="font-bold text-stone-800 text-xs truncate">${info.title}</p>
                     <p class="text-[10px] text-stone-500 truncate">${info.authors ? info.authors[0] : 'Unknown'}</p>
                 </div>
             `;
            grid.appendChild(card);
        });
        importReviewList.appendChild(grid);
    }
}
"""

with open('js/app.js', 'r') as f:
    lines = f.readlines()

# Replace lines 1104 to 1246 (0-indexed: 1103 to 1246)
start_line = 1103
end_line = 1246 

# Verify we are cutting correct area
print(f"Replacing from line {start_line+1}: {lines[start_line].strip()}")
print(f"Replacing to line {end_line}: {lines[end_line-1].strip()}")
print(f"Next line will be: {lines[end_line].strip()}")

new_lines = lines[:start_line] + [new_code + "\n\n"] + lines[end_line:]

with open('js/app.js', 'w') as f:
    f.writelines(new_lines)

print("Successfully replaced renderImportReview!")
