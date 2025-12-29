// --- Configuration ---
const GOOGLE_API_KEY = ''; // Add your API key here if needed for public deployment, currently using implicit or restricted key
// Note: In a real production app, use a proxy server to hide API keys.

// --- Gemini AI Configuration ---
// Uses /api/gemini serverless function for secure API calls
// API key is stored in Vercel environment variables, never exposed to browser
const GEMINI_PROXY_URL = '/api/gemini';

// --- Supabase Client ---
const supabaseUrl = 'https://rqbtntzqqkekdzvfilos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYnRudHpxcWtla2R6dmZpbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDEwMjUsImV4cCI6MjA4MDA3NzAyNX0.iKeTABH2Q_s9BjpMmigroSa0fqeyW8DDcmXRwDO0jjM';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- State ---
let user = null;
let savedBookIds = new Set();
let allSavedBooks = []; // Store full list for client-side filtering
// Font Size State
const fontSizes = ['90%', '100%', '110%', '125%'];
let currentFontSizeIndex = 1; // Default to 100%

// --- DOM Elements ---
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const navActions = document.getElementById('nav-actions');
const logoutBtn = document.getElementById('logout-btn');

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');
const resultsGrid = document.getElementById('results-grid');

const savedGrid = document.getElementById('saved-grid');
const savedTableContainer = document.getElementById('saved-table-container');
const savedTableBody = document.getElementById('saved-table-body');
const refreshSavedBtn = document.getElementById('refresh-saved-btn');
const viewGridBtn = document.getElementById('view-grid-btn');
const viewTableBtn = document.getElementById('view-table-btn');
const importBtn = document.getElementById('nav-import-btn');
const exportBtn = document.getElementById('nav-export-btn');
const exportScheduleBtn = document.getElementById('nav-export-schedule-btn');

// ... existing code ...

if (exportScheduleBtn) {
    exportScheduleBtn.addEventListener('click', exportScheduleToCSV);
}

function exportScheduleToCSV() {
    // 1. Filter: Status = 'Scheduled'
    const scheduledBooks = allSavedBooks.filter(book => book.status === 'Scheduled');

    if (scheduledBooks.length === 0) {
        showSimpleAlert('No scheduled books found to export.');
        return;
    }

    // 2. Sort: Date Scheduled (Ascending)
    scheduledBooks.sort((a, b) => {
        const dateA = new Date(a.target_date || '9999-12-31');
        const dateB = new Date(b.target_date || '9999-12-31');
        return dateA - dateB;
    });

    // 3. Generate CSV Content
    // Header
    let csvContent = "Book Title,Book Author,Date Scheduled,Host\n";

    // Rows
    scheduledBooks.forEach(book => {
        const title = (book.title || '').replace(/,/g, ''); // Simple cleaning
        const author = (book.author || '').replace(/,/g, '');
        const date = book.target_date || '';
        const host = (book.host_name || '').replace(/,/g, '');

        csvContent += `${title},${author},${date},${host}\n`;
    });

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "book_club_schedule.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSimpleAlert(`Exported ${scheduledBooks.length} scheduled books.`);
}

// Filter Elements
const filterTag = document.getElementById('filter-tag');
const filterRating = document.getElementById('filter-rating');
// filterYear removed (replaced by custom logic)
// filterStatus removed (replaced by custom logic)
const sortBy = document.getElementById('sort-by');

// --- Filtering & Sorting ---
function applyFilters() {
    const status = currentStatusFilter; // Use the variable, not the element value
    const year = document.getElementById('filter-year').value;
    const tag = document.getElementById('filter-tag').value;
    const sort = document.getElementById('sort-by').value;
}

// Modal Elements
const modal = document.getElementById('book-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const closeModalBottomBtn = document.getElementById('close-modal-bottom-btn');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalAuthors = document.getElementById('modal-authors');
// modalYear removed
const modalPages = document.getElementById('modal-pages');
const modalRating = document.getElementById('modal-rating');
const modalOlRating = document.getElementById('modal-ol-rating');
const modalDescription = document.getElementById('modal-description');
const modalDescriptionContainer = document.getElementById('modal-description-container');
const seeMoreBtn = document.getElementById('see-more-btn');
const linkGoodreads = document.getElementById('link-goodreads');
const linkAmazon = document.getElementById('link-amazon');
const linkLibrary = document.getElementById('link-library');

const modalSaveSection = document.getElementById('modal-save-section');
const modalSaveBtn = document.getElementById('modal-save-btn');

const modalEditSection = document.getElementById('modal-edit-section');
const editStatus = document.getElementById('edit-status');
const editRating = document.getElementById('edit-rating');
const refreshMetadataBtn = document.getElementById('refresh-metadata-btn');
const modalAiTagsBtn = document.getElementById('modal-ai-tags-btn');
// const editTags = document.getElementById('edit-tags'); // Replaced by interactive UI
const modalTagsContainer = document.getElementById('modal-tags-container');
const addTagInput = document.getElementById('add-tag-input');
const tagSuggestions = document.getElementById('tag-suggestions');
const addTagBtn = document.getElementById('add-tag-btn');
let currentModalTags = []; // State for modal tags
const editDate = document.getElementById('edit-date');
// editClubYear removed
const editHost = document.getElementById('edit-host');
const editNotes = document.getElementById('edit-notes');
const modalUpdateBtn = document.getElementById('modal-update-btn');
const modalDeleteBtn = document.getElementById('modal-delete-btn');

// Error Modal Elements
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error-btn');

// Import Modal Elements
const importModal = document.getElementById('import-modal');
const closeImportBtn = document.getElementById('close-import-btn');
const cancelImportBtn = document.getElementById('cancel-import-btn');
const startImportBtn = document.getElementById('start-import-btn');
const importText = document.getElementById('import-text');
const importProgress = document.getElementById('import-progress');
const importBar = document.getElementById('import-bar');
const importStatus = document.getElementById('import-status');
const importReviewSection = document.getElementById('import-review-section');
const importReviewList = document.getElementById('import-review-list');
const importAutoSummary = document.getElementById('import-auto-summary');
const saveImportBtn = document.getElementById('save-import-btn');
const importInstructions = document.getElementById('import-instructions');
let importCandidates = []; // Store search results for review
let autoImported = []; // Store exact matches ready for saving

// Dashboard Elements
const dashboardSection = document.getElementById('dashboard-section');
const dashboardHero = document.getElementById('dashboard-hero');
const dashboardUpcomingContainer = document.getElementById('dashboard-upcoming-container');
const dashboardUpcomingList = document.getElementById('dashboard-upcoming-list');
const dashboardEmpty = document.getElementById('dashboard-empty');


// --- Auth Logic ---

async function handleAuth(e) {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showError(error.message);
    } else {
        // UI updates handled by onAuthStateChange
    }
}

let isInitialLoad = true;

function updateUI() {
    if (user) {
        authSection.classList.add('hidden');
        appSection.classList.remove('hidden');
        navActions.classList.remove('hidden');

        // Init Font Size
        initFontSize();

        // Only default to dashboard on initial load or fresh login
        // If we are already viewing a section (e.g. library), don't jump
        if (isInitialLoad || appSection.classList.contains('hidden')) {
            showSection('dashboard');
            isInitialLoad = false;
        }

        fetchSavedBooks(); // Load books then render dashboard
    } else {
        authSection.classList.remove('hidden');
        appSection.classList.add('hidden');
        navActions.classList.add('hidden');
        isInitialLoad = true; // Reset so next login redirects
    }
}

loginForm.addEventListener('submit', handleAuth);

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// --- Font Size Logic ---
// --- Font Size Logic ---
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');

// --- Test Data Logic ---
let showTestData = localStorage.getItem('bookClubShowTestData') === 'true';
const testDataToggle = document.getElementById('toggle-test-data');

function initTestData() {
    if (testDataToggle) {
        testDataToggle.checked = showTestData;
        testDataToggle.addEventListener('change', (e) => {
            showTestData = e.target.checked;
            localStorage.setItem('bookClubShowTestData', showTestData);
            // Re-fetch/render to apply new filter
            fetchSavedBooks();
        });
    }
}

// Ensure init is called
document.addEventListener('DOMContentLoaded', () => {
    initTestData();
});

function initFontSize() {
    const saved = localStorage.getItem('bookClubFontSize') || '100%';
    setFontSize(saved, false); // false = don't save again
}

function setFontSize(size, save = true) {
    document.documentElement.style.fontSize = size;
    if (save) localStorage.setItem('bookClubFontSize', size);
    updateFontSizeMenu(size);
}

function updateFontSizeMenu(activeSize) {
    if (!settingsMenu) return;
    const buttons = settingsMenu.querySelectorAll('.text-size-option');
    buttons.forEach(btn => {
        if (btn.dataset.size === activeSize) {
            btn.classList.add('font-bold', 'bg-stone-50', 'text-stone-800');
            btn.classList.remove('text-stone-600');
        } else {
            btn.classList.remove('font-bold', 'bg-stone-50', 'text-stone-800');
            btn.classList.add('text-stone-600');
        }
    });
}

// --- Helper: Render Rating Badges ---
function renderRatingBadges(book, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (book.rating) {
        const source = book.rating_source || 'manual';
        const count = book.rating_count;

        // Format count
        let countDisplay = '';
        if (count) {
            if (count >= 1000000) countDisplay = `(${Math.round(count / 100000) / 10}M)`;
            else if (count >= 1000) countDisplay = `(${Math.round(count / 1000)}K)`;
            else countDisplay = `(${count})`;
        }

        // Styles
        let badgeClass = 'bg-stone-100 text-stone-600 border-stone-200';
        let icon = '';
        if (source === 'goodreads') {
            badgeClass = 'bg-[#f4f1ea] text-[#382110] border-[#ece9df]';
            icon = '<iconify-icon icon="fa6-brands:goodreads" class="mr-1"></iconify-icon>';
        } else if (source === 'openlibrary') {
            badgeClass = 'bg-blue-50 text-blue-700 border-blue-100';
            icon = '<iconify-icon icon="fa6-solid:book-open" class="mr-1"></iconify-icon>';
        }

        el.innerHTML = `<span class="px-3 py-1 rounded-full border ${badgeClass} font-medium flex items-center justify-center gap-1.5 shadow-sm text-sm" title="Source: ${source}">
            ${icon}
            ★ ${book.rating} <span class="opacity-70 text-xs ml-0.5">${countDisplay}</span>
        </span>`;
        el.classList.remove('hidden');
    }
}

// --- Metadata Refresh ---
async function refreshBookMetadata(book) {
    if (!refreshMetadataBtn) return;

    try {
        refreshMetadataBtn.innerHTML = '<iconify-icon icon="line-md:loading-loop" class="text-sm"></iconify-icon> Fetching...';
        refreshMetadataBtn.disabled = true;

        // 1. Ensure we have Google Data (needed for ISBN lookup for rating)
        let gData = book.google_data;
        if (!gData) {
            const results = await smartBookSearch(`${book.title} ${book.author}`);
            if (results && results.length > 0) gData = results[0];
        }

        // 2. Fetch Goodreads Rating
        const isbn = gData?.volumeInfo?.industryIdentifiers?.find(
            id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
        )?.identifier;

        const gr = await getGoodreadsRating(isbn, book.title, book.author);

        // 3. Update DB
        const updates = {};

        if (gr) {
            updates.rating = parseFloat(gr.rating);
            updates.rating_source = 'goodreads';
            updates.rating_count = gr.count;
        }

        if (Object.keys(updates).length > 0) {
            // Include google_data if we fetched it fresh
            if (!book.google_data && gData) updates.google_data = gData;

            const { error } = await supabase.from('book_club_list').update(updates).eq('id', book.id);
            if (error) throw error;

            // 4. Update Local State & UI
            if (updates.rating) {
                book.rating = updates.rating;
                book.rating_source = updates.rating_source;
                book.rating_count = updates.rating_count;
                document.getElementById('edit-rating').value = updates.rating;

                // Update badge if valid
                renderRatingBadges(book, 'modal-rating');
            }

            // Sync to global list
            const idx = allSavedBooks.findIndex(b => b.id === book.id);
            if (idx !== -1) {
                Object.assign(allSavedBooks[idx], updates);
            }

            // Re-render with current filters preserved
            applyFilters();

            showSimpleAlert('Rating updated!');
        } else {
            showSimpleAlert('No new rating found.');
        }

    } catch (e) {
        console.error(e);
        showError('Refresh failed: ' + e.message);
    } finally {
        refreshMetadataBtn.innerHTML = '<iconify-icon icon="solar:refresh-circle-broken" class="text-sm"></iconify-icon> Fetch Rating';
        refreshMetadataBtn.disabled = false;
    }
}


// --- Event Listeners ---
// --- Event Listeners ---
if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('hidden');
    });

    // Font Size Buttons
    settingsMenu.querySelectorAll('.text-size-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = btn.dataset.size;
            setFontSize(size);
        });
    });

    // Close on Click Outside
    window.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
            settingsMenu.classList.add('hidden');
        }
    });
}

// --- Custom Status Dropdown Logic ---
const filterStatusBtn = document.getElementById('filter-status-btn');
const filterStatusMenu = document.getElementById('filter-status-menu');
const filterStatusLabel = document.getElementById('filter-status-label');
let currentStatusFilter = 'all'; // State for the filter

if (filterStatusBtn && filterStatusMenu) {
    // Toggle Menu
    filterStatusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterStatusMenu.classList.toggle('hidden');
        // Close other menus if open (optional)
    });

    // Handle Selection
    filterStatusMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            currentStatusFilter = value;

            // Update UI Label
            filterStatusLabel.textContent = value === 'all' ? 'Statuses' : value;

            // Update Active State
            filterStatusMenu.querySelectorAll('button').forEach(b => b.classList.remove('text-rose-600', 'bg-stone-50'));
            if (value !== 'all') btn.classList.add('text-rose-600', 'bg-stone-50');

            // Apply Filter
            applyFilters();

            // Close Menu
            filterStatusMenu.classList.add('hidden');
        });
    });

    // Close on Click Outside
    window.addEventListener('click', (e) => {
        if (!filterStatusBtn.contains(e.target) && !filterStatusMenu.contains(e.target)) {
            filterStatusMenu.classList.add('hidden');
        }
    });
}

// --- Custom Year Dropdown Logic ---
const filterYearBtn = document.getElementById('filter-year-btn');
const filterYearMenu = document.getElementById('filter-year-menu');
const filterYearLabel = document.getElementById('filter-year-label');
let currentYearFilter = 'all';

if (filterYearBtn && filterYearMenu) {
    filterYearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterYearMenu.classList.toggle('hidden');
    });

    window.addEventListener('click', (e) => {
        if (!filterYearBtn.contains(e.target) && !filterYearMenu.contains(e.target)) {
            filterYearMenu.classList.add('hidden');
        }
    });
}

// Ensure login persists
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        user = session?.user;
        if (user) {
            updateUI(); // updateUI calls fetchSavedBooks internally
        }
    } else if (event === 'SIGNED_OUT') {
        user = null;
        window.location.reload();
    }
});

// Check initial session (fallback if onAuthStateChange doesn't fire)
supabase.auth.getSession().then(({ data: { session } }) => {
    // Only initialize if not already done by onAuthStateChange
    if (!user && session?.user) {
        user = session.user;
        updateUI(); // updateUI calls fetchSavedBooks internally
    } else if (!user && !session) {
        // No session, show login
        updateUI();
    }
});


// --- Search Logic ---

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// --- Junk Book Filter (shared between search and import) ---
function isJunkBook(item) {
    const info = item.volumeInfo;
    const date = info.publishedDate;
    const bookTitle = (info.title || '').toLowerCase();
    const publisher = (info.publisher || '').toLowerCase();

    // Date filter
    if (date && date.substring(0, 4) < "1900") return true;

    // Title-based junk
    if (bookTitle.includes('summary') || bookTitle.includes('summarized')) return true;
    if (bookTitle.includes('study guide') || bookTitle.includes('analysis of')) return true;
    if (bookTitle.includes('adapted') || bookTitle.includes('young readers')) return true;
    if (bookTitle.includes('abridged') || bookTitle.includes('busy people')) return true;
    if (bookTitle.includes('graphic novel') || bookTitle.includes('coloring book')) return true;
    if (bookTitle.includes('bundle') || bookTitle.includes('box set') || bookTitle.includes('boxed set')) return true;
    if (bookTitle.includes('-book set') || bookTitle.includes('book collection')) return true;
    if (bookTitle.includes('conversation starter')) return true;
    if (bookTitle.includes('amazing fact')) return true;
    if (bookTitle.includes('digest and review') || bookTitle.includes('digest & review')) return true;
    if (bookTitle.includes('trivia-on-books') || bookTitle.includes('trivia on books')) return true;
    if (bookTitle.includes('reader\'s companion') || bookTitle.includes("readers companion")) return true;
    if (bookTitle.includes('for fans of')) return true;

    // Publisher-based junk
    if (publisher.includes('trivion') || publisher.includes('dailybooks') || publisher.includes('daily books')) return true;
    if (publisher.includes('g whiz') || publisher.includes('whiz books')) return true;

    return false;
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    searchBtn.textContent = 'Searching...';
    searchBtn.disabled = true;
    resultsContainer.classList.remove('hidden');
    resultsGrid.innerHTML = '<p class="text-center col-span-full text-stone-500">Searching Google Books...</p>';

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=en&maxResults=12&key=${GOOGLE_API_KEY}`);
        const data = await response.json();

        resultsGrid.innerHTML = '';

        if (data.items && data.items.length > 0) {
            // Filter out junk results
            const cleanItems = data.items.filter(item => !isJunkBook(item));
            const itemsToShow = cleanItems.length > 0 ? cleanItems : data.items;

            itemsToShow.forEach(book => {
                const card = createBookCard(book);
                resultsGrid.appendChild(card);
            });
        } else {
            resultsGrid.innerHTML = '<p class="text-center col-span-full text-stone-500">No books found.</p>';
        }

    } catch (error) {
        console.error('Search error:', error);
        resultsGrid.innerHTML = '<p class="text-center col-span-full text-red-500">Error searching books. Please try again.</p>';
    }

    searchBtn.textContent = 'Search';
    searchBtn.disabled = false;
}

function createBookCard(book) {
    const info = book.volumeInfo;
    const isSaved = savedBookIds.has(book.id);
    const thumbnail = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover';
    const authors = info.authors ? info.authors.join(', ') : 'Unknown Author';
    const year = info.publishedDate ? info.publishedDate.substring(0, 4) : '';

    const div = document.createElement('div');
    div.className = 'card-modern flex flex-row items-center h-full fade-in group relative';
    div.innerHTML = `
        <div class="book-frame-modern w-20 md:w-24 border-r border-stone-200 self-stretch">
            <img src="${thumbnail}" alt="${info.title}" class="book-cover-shadow w-full h-auto object-contain max-h-full" onerror="this.onerror=null; this.src='https://via.placeholder.com/128x192?text=No+Cover'">
        </div>

        <div class="p-3 md:p-4 flex flex-col justify-center min-w-0 flex-grow">
            <h3 class="font-serif font-bold text-base text-stone-800 leading-tight mb-1 truncate" title="${info.title}">${info.title}</h3>
            <p class="text-xs text-stone-600 mb-1 truncate">${authors}</p>
            <p class="text-[10px] text-stone-400 mb-2">${year}</p>
            
            <div class="flex items-center gap-2 mt-auto">
                <button class="text-[10px] ${isSaved ? 'bg-green-100 text-green-700 border-green-200 cursor-default' : 'btn-secondary border-rose-200 text-rose-600 hover:bg-rose-50'} px-2.5 py-1 rounded-full transition font-medium"
                    data-book-id="${book.id}">
                    ${isSaved ? 'Saved!' : 'View Details'}
                </button>
            </div>
        </div>
    `;

    // Click handler for the whole card or button
    div.addEventListener('click', () => openModal(book));

    return div;
}

// --- Error Handling ---

function showError(msg) {
    errorMessage.textContent = msg;
    errorModal.classList.remove('hidden');
}

closeErrorBtn.addEventListener('click', () => {
    errorModal.classList.add('hidden');
});

// --- AI-Powered Tagging & Summary (Gemini) ---
// Controlled vocabulary for AI-generated tags
const TAG_VOCABULARY = {
    genre: ['Literary Fiction', 'Historical Fiction', 'Mystery', 'Thriller', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'Biography & Autobiography', 'Memoir', 'Non-Fiction', 'History', 'Science', 'Self-Help', 'Business/Econ'],
    era: ['1800s', '1900s', '1920s', '1930s', '1940s', 'WWII', 'Civil War', '1950s', '1960s', '1970s', '1980s', '1990s', 'Contemporary'],
    countries: ['USA', 'England', 'UK', 'Ireland', 'France', 'Germany', 'Poland', 'Israel', 'Italy', 'Spain', 'Russia', 'Japan', 'China', 'India', 'Australia', 'Mexico', 'Canada'],
    regions: ['New York', 'Paris', 'London', 'California', 'US South', 'Europe', 'Asia', 'Middle East', 'Africa', 'Latin America'],
    themes: ['Family', 'War', 'Love', 'Identity', 'Race', 'Feminism', 'Coming of Age', 'Survival', 'Art', 'Politics', 'Religion']
};

const TAG_ALIASES = {
    'historical': 'Historical Fiction',
    'fiction': 'Literary Fiction',
    'southern': 'US South',
    'south': 'US South',
    'united states': 'USA',
    'america': 'USA',
    'us': 'USA',
    'great britain': 'UK',
    'england': 'UK',
    'second world war': 'WWII',
    'world war 2': 'WWII',
    'world war ii': 'WWII'
};

async function generateTagsAI(title, author, description) {
    const prompt = `You are an expert literary classifier. Analyze the book details to connect it with the most accurate tags from the vocabulary.

BOOK:
Title: ${title}
Author: ${author}
Description: ${description}

RULES:
1. Use ONLY tags from this controlled vocabulary:
   - Genre: ${TAG_VOCABULARY.genre.join(', ')}
   - Era: ${TAG_VOCABULARY.era.join(', ')}
   - Countries: ${TAG_VOCABULARY.countries.join(', ')}
   - Regions/Cities: ${TAG_VOCABULARY.regions.join(', ')}
   - Themes: ${TAG_VOCABULARY.themes.join(', ')}
2. Do NOT invent new tags. Only use exact matches from the list above.
3. Instructions: Identify highly relevant tags from any category (Genre, Era, Location, Theme).
4. Aim for 3-5 tags that best describe the book.
5. Return ONLY a comma-separated list of tags.

TAGS:`;

    try {
        const response = await fetch(GEMINI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                temperature: 0.3,
                maxTokens: 100
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        const tagText = data.text || '';

        // Parse and validate tags
        const cleanText = tagText.replace(/^tags:?\s*/i, '').replace(/[\[\]"]/g, '');
        const tags = cleanText.split(',').map(t => t.trim()).filter(t => t);

        const allVocab = [...TAG_VOCABULARY.genre, ...TAG_VOCABULARY.era, ...TAG_VOCABULARY.countries, ...TAG_VOCABULARY.regions, ...TAG_VOCABULARY.themes];

        // Fuzzy Match (Case Insensitive + Aliases)
        const validTags = [];
        const filteredTags = [];

        tags.forEach(userTag => {
            let searchTag = userTag.toLowerCase();

            // Check Alias
            if (TAG_ALIASES[searchTag]) {
                searchTag = TAG_ALIASES[searchTag].toLowerCase();
            }

            // Find canonical match in vocab
            const match = allVocab.find(v => v.toLowerCase() === searchTag);
            if (match) {
                validTags.push(match);
            } else {
                filteredTags.push(userTag);
            }
        });

        return {
            success: true,
            tags: [...new Set(validTags)], // Deduplicate
            raw: tagText,
            filtered: filteredTags
        };

    } catch (e) {
        console.error('AI Tag Generation Error:', e);
        return { success: false, error: e.message || 'Unknown error' };
    }
}

async function generateSummaryAI(title, author, description) {
    const prompt = `You are writing the back-cover summary for a paperback book. Given the raw description below, write a compelling summary.

BOOK:
Title: ${title}
Author: ${author}
Raw Description: ${description}

RULES:
1. Write in the style of a paperback back-cover: short, punchy, hooks the reader.
2. Set the stage for what the book is about without spoilers.
3. Remove all testimonials, blurbs, and "Praise for..." quotes.
4. Keep it to 2-3 short paragraphs maximum.
5. Return ONLY the summary text, no headers or labels.

SUMMARY:`;

    try {
        const response = await fetch(GEMINI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                temperature: 0.7,
                maxTokens: 300
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data.text?.trim() || null;
    } catch (e) {
        console.error('AI Summary Generation Error:', e);
        return null;
    }
}

// Console test function for Phase 2 proof of concept
// Usage: testAIFunctions() or testAIFunctions('This is Happiness')
async function testAIFunctions(bookTitle = null) {
    // Find test books (status = 'Test')
    const testBooks = allSavedBooks.filter(b => b.status === 'Test');

    if (testBooks.length === 0) {
        console.log('⚠️ No books with status="Test" found. Add some test books first.');
        return;
    }

    const booksToTest = bookTitle
        ? testBooks.filter(b => b.title.toLowerCase().includes(bookTitle.toLowerCase()))
        : testBooks;

    if (booksToTest.length === 0) {
        console.log(`⚠️ No test book matching "${bookTitle}" found.`);
        return;
    }

    console.log(`🧪 Testing AI functions on ${booksToTest.length} book(s)...\n`);

    for (const book of booksToTest) {
        const info = book.google_data?.volumeInfo || {};
        const description = info.description || 'No description available';

        console.log(`📚 BOOK: ${book.title} by ${book.author}`);
        console.log('─'.repeat(50));

        // Current tags
        console.log('Current Tags:', book.tags?.join(', ') || 'None');

        // AI Tags
        console.log('⏳ Generating AI tags...');
        const aiTags = await generateTagsAI(book.title, book.author, description);
        console.log('AI Tags:', aiTags?.join(', ') || 'Failed');

        // AI Summary
        console.log('⏳ Generating AI summary...');
        const aiSummary = await generateSummaryAI(book.title, book.author, description);
        console.log('\nAI Summary:');
        console.log(aiSummary || 'Failed');

        console.log('\n' + '═'.repeat(50) + '\n');
    }

    console.log('✅ Test complete! (No database changes made)');
}

// Make test function globally available
window.testAIFunctions = testAIFunctions;

// --- Auto-Tagging Logic ---
function generateTags(book) {
    const info = book.volumeInfo;
    const tags = new Set();
    const categories = (info.categories || []).map(c => c.toLowerCase());
    const isExplicitlyFiction = categories.some(c => c.includes('fiction') && !c.includes('non-fiction'));

    // 1. Add Categories (Cleaned)
    if (info.categories) {
        info.categories.forEach(c => {
            if (c === 'Business & Economics') {
                tags.add('Business/Econ');
            } else if (c.includes('Fiction')) {
                // Don't add generic "Fiction" tag, wait for specific sub-genres
            } else {
                tags.add(c);
            }
        });
    }

    // 2. Scan Description for Keywords
    const text = (info.description || '') + ' ' + (info.title || '');
    const lowerText = text.toLowerCase();

    // A. Genres & Themes
    const keywords = {
        'Mystery': ['mystery', 'detective', 'crime', 'thriller', 'murder'],
        'Sci-Fi': ['science fiction', 'sci-fi', 'space opera', 'alien', 'cyberpunk', 'time travel'],
        'Fantasy': ['fantasy', 'magic', 'wizard', 'dragon', 'sword', 'witch'],
        'Historical': ['historical fiction', 'historical', 'ancient', 'medieval', 'victorian'], // Changed from 'Historical Fiction' to 'Historical'
        'Romance': ['romance', 'love story'],
        'Memoir': ['memoir', 'autobiography', 'diary'],
        'Biography': ['biography'], // Removed 'life of' - too generic (e.g. "life of a sea woman")
        'Non-Fiction': ['non-fiction', 'history', 'psychology', 'business', 'self-help', 'science'],
        'Classic': ['classic literature', 'classic'],
        'Dystopian': ['dystopian', 'post-apocalyptic'],
        'Young Adult': ['young adult', 'ya '],
        'Thriller': ['thriller', 'suspense', 'psychological'],
        'Women\'s Fiction': ['women\'s fiction', 'female friendship'],
        'Literary Fiction': ['literary fiction']
    };

    for (const [tag, words] of Object.entries(keywords)) {
        if (words.some(w => lowerText.includes(w))) {
            tags.add(tag);
        }
    }

    // B. Decades / Eras (Regex)
    // Matches 1900s-1990s
    const yearMatch = text.match(/\b(19\d{2})s?\b/);
    if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        if (year >= 1900 && year < 2000) {
            const decade = Math.floor(year / 10) * 10;
            tags.add(`${decade}s`);
        }
    }
    // Specific Eras
    if (lowerText.includes('world war ii') || lowerText.includes('wwii') || lowerText.includes('second world war')) tags.add('WWII');
    if (lowerText.includes('world war i') || lowerText.includes('wwi') || lowerText.includes('first world war')) tags.add('WWI');
    if (lowerText.includes('civil war')) tags.add('Civil War');
    if (lowerText.includes('cold war')) tags.add('Cold War');
    if (lowerText.includes('depression') && lowerText.includes('great')) tags.add('Great Depression');

    // C. Locations
    const locations = {
        'France': ['france', 'paris', 'french'],
        'England': ['england', 'london', 'british', 'english'],
        'US South': ['us south', 'american south', 'georgia', 'alabama', 'mississippi', 'carolina'],
        'New York': ['new york', 'nyc', 'manhattan', 'brooklyn'],
        'Italy': ['italy', 'rome', 'venice', 'italian'],
        'India': ['india', 'indian', 'mumbai', 'delhi'],
        'Africa': ['africa', 'african', 'nigeria', 'kenya'],
        'Asia': ['asia', 'asian', 'china', 'japan', 'korea'],
        'Ireland': ['ireland', 'irish', 'dublin'],
        'Israel': ['israel', 'jerusalem', 'tel aviv']
    };

    for (const [loc, words] of Object.entries(locations)) {
        if (words.some(w => lowerText.includes(w))) {
            tags.add(loc);
        }
    }

    // 3. Logic Deduction (Compound Genres)
    // Rule: If it works like History but talks like Fiction, it's Historical Fiction.
    const hasFiction = tags.has('Fiction') || isExplicitlyFiction || tags.has('Historical Fiction');
    const hasHistory = tags.has('History') || tags.has('Historical');

    if (hasFiction && hasHistory) {
        tags.add('Historical Fiction');
        tags.delete('History');
        tags.delete('Historical');
        tags.delete('Fiction'); // Sub-genre replaces parent
        tags.delete('Non-Fiction'); // History often triggers this, remove it
    }

    // 4. Refine Tags (Final Exclusions)

    // Safety Check: If Google says it's Fiction, REMOVE Non-Fiction tags derived from keywords
    if (isExplicitlyFiction) {
        tags.delete('Non-Fiction');
        tags.delete('Biography'); // Usually biographic fiction
        tags.delete('Memoir');
    }

    // Standard Exclusions
    if (tags.has('Non-Fiction')) {
        tags.delete('Fiction');
        tags.delete('Sci-Fi');
        tags.delete('Fantasy');
        tags.delete('Thriller');
        tags.delete('Mystery');
        tags.delete('Romance');
        tags.delete('Women\'s Fiction');
        tags.delete('Historical Fiction');
    }

    if (!tags.has('Non-Fiction')) {
        // Sub-genre cleanup for Fiction
        if (tags.has('Sci-Fi') || tags.has('Fantasy') || tags.has('Mystery') || tags.has('Thriller') || tags.has('Historical Fiction')) {
            tags.delete('Fiction');
        }
    }

    // If Memoir/Biography survives the Fiction purge, it enforces Non-Fiction
    if (tags.has('Memoir') || tags.has('Biography')) {
        tags.add('Non-Fiction');
        tags.delete('Fiction');
    }

    // Final cleanup: Ensure "Read" is NEVER a tag (it's a status)
    const finalTags = Array.from(tags).filter(t => t.toLowerCase() !== 'read');
    return finalTags.join(', ');
}

// --- Modal Logic ---

function openModal(book, savedData = null) {
    const info = book.volumeInfo;
    const isSaved = savedBookIds.has(book.id);

    // Update suggestions
    updateTagSuggestions();

    // Clear previous badges
    const existingBadge = document.getElementById('ebook-badge');
    if (existingBadge) existingBadge.remove();

    // Populate Basic Data
    // Phase 2: Robust Image Fallback (High Res -> Standard -> Placeholder)
    const setCoverImage = (url) => {
        // Helper to ensure HTTPS
        if (url && url.startsWith('http:')) {
            url = url.replace('http:', 'https:');
        }
        return url;
    };

    const standardThumb = setCoverImage(info.imageLinks?.thumbnail);

    // FIX: Rely on the standard thumbnail (zoom=1) which is reliable and matches the library view.
    // We only remove the 'edge=curl' parameter for a cleaner look if possible.
    let modalThumb = null;
    if (standardThumb) {
        modalThumb = standardThumb.replace('&edge=curl', '');
    }

    const placeholder = 'https://via.placeholder.com/128x192?text=No+Cover';

    // Reset loop protection
    modalImage.onload = null;
    modalImage.onerror = null;

    if (modalThumb) {
        modalImage.src = modalThumb;
        modalImage.onerror = () => {
            // Fallback to placeholder if even the standard thumb fails
            modalImage.src = placeholder;
            modalImage.onerror = null; // Prevent infinite loop
        };
    } else {
        modalImage.src = placeholder;
    }

    modalTitle.textContent = info.title;
    modalAuthors.textContent = info.authors ? info.authors.join(', ') : 'Unknown Author';
    // modalYear assignment removed
    modalPages.textContent = info.pageCount ? `${info.pageCount} pages` : 'Page count unknown';

    if (info.averageRating) {
        modalRating.textContent = `Google: ★ ${info.averageRating}`;
        modalRating.classList.remove('hidden');
    } else {
        modalRating.classList.add('hidden');
    }

    // Display saved rating with source (overrides Google display)
    // Display saved rating with source (overrides Google display)
    if (savedData && savedData.rating) {
        renderRatingBadges(savedData, 'modal-rating');
    }

    // Reset Open Library Rating
    modalOlRating.classList.add('hidden');
    modalOlRating.textContent = '';

    // Format description for readability: preserve paragraph breaks
    let desc = info.description || 'No description available.';
    // Convert multiple newlines or <br> sequences to proper paragraph breaks
    desc = desc.replace(/\n\n+/g, '<br><br>');
    desc = desc.replace(/(<br\s*\/?\s*>){2,}/gi, '<br><br>');
    // Add break after sentences ending with quotes followed by em-dash OR double-hyphen
    desc = desc.replace(/([.!?]["'])\s*[—-]{1,2}/g, '$1<br><br>—');
    // 3. Add break after attribution lines (em-dash/double-hyphen + author name + start of new sentence)
    desc = desc.replace(/([—-]{1,2}[A-Z][^.!?<]{5,60}?)\s+(?=[A-Z][a-z])/g, '$1<br><br>');

    // 4. Add break before common narrative transition phrases
    desc = desc.replace(/\.\s+(From the (?:award-winning |bestselling |#1 )?author)/gi, '.<br><br>$1');
    desc = desc.replace(/\.\s+(In (?:her|his|this|the) (?:new |latest |biggest )?)/gi, '.<br><br>$1');
    desc = desc.replace(/\.\s+(When (?:the|she|he|they) )/gi, '.<br><br>$1');
    desc = desc.replace(/\.\s+(Now,? (?:she|he|they|the) )/gi, '.<br><br>$1');
    desc = desc.replace(/\.\s+(As (?:she|he|they|the) )/gi, '.<br><br>$1');
    desc = desc.replace(/\.\s+(With (?:the|her|his) )/gi, '.<br><br>$1');

    // 5. Break long paragraphs: apply chunking PER PARAGRAPH (not just when no breaks exist)
    const paragraphs = desc.split('<br><br>');
    const chunkedParagraphs = paragraphs.map(p => {
        const sentences = p.split(/(?<=[.!?])\s+(?=[A-Z])/);
        if (sentences.length > 4) {
            const chunks = [];
            for (let i = 0; i < sentences.length; i += 3) {
                chunks.push(sentences.slice(i, i + 3).join(' '));
            }
            return chunks.join('<br><br>');
        }
        return p;
    });
    desc = chunkedParagraphs.join('<br><br>');

    modalDescription.innerHTML = desc;

    // Reset See More
    modalDescriptionContainer.classList.add('line-clamp-3');
    seeMoreBtn.textContent = 'See more';
    seeMoreBtn.classList.add('hidden');

    // Setup Research Links
    const isbnObj = info.industryIdentifiers?.find(id => id.type === 'ISBN_13') || info.industryIdentifiers?.find(id => id.type === 'ISBN_10');
    const isbn = isbnObj ? isbnObj.identifier : null;

    const query = encodeURIComponent(`${info.title} ${info.authors ? info.authors[0] : ''}`);

    // Re-query link elements to ensure we have the correct DOM references
    const activeLinkGoodreads = document.getElementById('link-goodreads');
    const activeLinkAmazon = document.getElementById('link-amazon');
    const activeLinkLibrary = document.getElementById('link-library');

    if (activeLinkGoodreads && activeLinkAmazon && activeLinkLibrary) {
        if (isbn) {
            activeLinkGoodreads.href = `https://www.goodreads.com/search?q=${isbn}`;
            // Use i=stripbooks to prioritize physical books over audiobooks
            activeLinkAmazon.href = `https://www.amazon.com/s?k=${isbn}&i=stripbooks`;
            // Use title+author keyword search - ISBN search often returns no results
            activeLinkLibrary.href = `https://fcplcat.fairfaxcounty.gov/search/searchresults.aspx?term=${encodeURIComponent(info.title + ' ' + (info.authors ? info.authors[0] : ''))}&by=KW`;
            activeLinkLibrary.classList.remove('hidden');

            // Fetch Open Library Rating
            fetchOpenLibraryRating(isbn, info.title, info.authors ? info.authors[0] : null);
        } else {
            activeLinkGoodreads.href = `https://www.goodreads.com/search?q=${query}`;
            // Use i=stripbooks to prioritize physical books over audiobooks
            activeLinkAmazon.href = `https://www.amazon.com/s?k=${query}&i=stripbooks`;
            // Use title+author keyword search
            activeLinkLibrary.href = `https://fcplcat.fairfaxcounty.gov/search/searchresults.aspx?term=${query}&by=KW`;
            activeLinkLibrary.classList.remove('hidden'); // Show even without ISBN

            // Try fetching rating without ISBN
            fetchOpenLibraryRating(null, info.title, info.authors ? info.authors[0] : null);
        }

    } else {
        console.error('External link elements not found in modal.');
    }

    // Note: eBook badge removed - it was not wired to any action and caused confusion

    // Toggle Sections based on Saved Status
    if (isSaved) {
        modalSaveSection.classList.add('hidden');
        modalEditSection.classList.remove('hidden');

        // Reset Delete Button State (Fix for stuck "Deleting..." bug)
        modalDeleteBtn.textContent = 'Delete';
        modalDeleteBtn.disabled = false;

        // If savedData is missing (e.g. opened from search), try to find it in our local cache
        if (!savedData) {
            savedData = allSavedBooks.find(b => b.google_data.id === book.id);
        }

        if (savedData) {
            modalSaveSection.classList.add('hidden');
            modalEditSection.classList.remove('hidden');

            editStatus.value = savedData.status || '';
            editRating.value = savedData.rating ? String(savedData.rating) : ''; // Ensure it's a string for input value
            currentModalTags = savedData.tags && savedData.tags.length > 0 ? [...savedData.tags] : generateTags(book).split(', ').filter(t => t);
            renderModalTags();
            const editDate = document.getElementById('edit-date');
            const clearDateBtn = document.getElementById('clear-date-btn');

            if (clearDateBtn && editDate) {
                // Toggle button visibility
                const toggleClearBtn = () => {
                    if (editDate.value) {
                        clearDateBtn.classList.remove('hidden');
                    } else {
                        clearDateBtn.classList.add('hidden');
                    }
                };

                // Events
                editDate.addEventListener('change', toggleClearBtn);
                editDate.addEventListener('input', toggleClearBtn);
                clearDateBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    editDate.value = '';
                    toggleClearBtn();
                });

                // Helper to expose for modal open
                window.checkDateClearButton = toggleClearBtn;
            }

            // ... existing code ...

            editDate.value = savedData.target_date || '';
            if (window.checkDateClearButton) window.checkDateClearButton(); // Check initial state
            editHost.value = savedData.host_name || '';
            editNotes.value = savedData.user_notes || '';

            modalUpdateBtn.onclick = () => updateBook(savedData.id, book);
            refreshMetadataBtn.onclick = () => refreshBookMetadata(savedData);

            // --- AI Compare Button Scope ---
            if (modalAiTagsBtn) {
                if (savedData.status === 'Test') {
                    modalAiTagsBtn.classList.remove('hidden');
                    // Clone to strip old listeners
                    const newBtn = modalAiTagsBtn.cloneNode(true);
                    modalAiTagsBtn.parentNode.replaceChild(newBtn, modalAiTagsBtn);
                    newBtn.addEventListener('click', () => {
                        openComparisonModal(savedData);
                    });
                } else {
                    modalAiTagsBtn.classList.add('hidden');
                }
            }

            // Setup Delete Button
            modalDeleteBtn.onclick = () => deleteBook(savedData.id);
        } else {
            // Fallback if we somehow have the ID in the set but not the data (should be rare)
            modalEditSection.classList.add('hidden');
            modalSaveSection.classList.remove('hidden');
            modalSaveBtn.textContent = 'Already Saved (Refresh to Edit)';
            modalSaveBtn.disabled = true;
            modalSaveBtn.className = 'w-full md:w-auto bg-green-100 text-green-700 border border-green-200 px-6 py-2 rounded-full font-medium shadow-sm cursor-default';
        }

    } else {
        modalSaveSection.classList.remove('hidden');
        modalEditSection.classList.add('hidden');

        modalSaveBtn.textContent = 'Save to List';
        modalSaveBtn.disabled = false;
        modalSaveBtn.className = 'w-full md:w-auto btn-primary';

        modalSaveBtn.onclick = async () => {
            await saveBook(modalSaveBtn, book);
            // Update the button in the grid if visible
            const gridBtn = document.querySelector(`button[data-book-id="${book.id}"]`);
            if (gridBtn) {
                gridBtn.textContent = 'Saved!';
                gridBtn.classList.remove('bg-white', 'text-rose-600', 'border', 'border-rose-200', 'hover:bg-rose-50');
                gridBtn.classList.add('bg-green-100', 'text-green-700', 'border-green-200', 'cursor-default');
            }
            closeModal();
        };
    }

    // Show Modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Check for description overflow
    setTimeout(() => {
        if (modalDescriptionContainer.scrollHeight > modalDescriptionContainer.clientHeight) {
            seeMoreBtn.classList.remove('hidden');
        }
    }, 0);
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

closeModalBtn.addEventListener('click', closeModal);
if (closeModalBottomBtn) closeModalBottomBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

async function updateBook(id, googleBook) {
    try {
        modalUpdateBtn.textContent = 'Updating...';
        modalUpdateBtn.disabled = true;

        const updates = {
            status: editStatus.value || null,
            rating: editRating.value ? parseFloat(editRating.value) : null,
            tags: currentModalTags,
            tags: currentModalTags,
            target_date: editDate.value || null,
            host_name: editHost.value || null,
            user_notes: editNotes.value || null
        };

        const { error } = await supabase
            .from('book_club_list')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        // Refresh list and close
        await fetchSavedBooks();
        closeModal();

    } catch (error) {
        console.error('Error updating book:', error);
        showError(`Failed to update book. ${error.message || ''}`);
    } finally {
        modalUpdateBtn.textContent = 'Update Details';
        modalUpdateBtn.disabled = false;
    }
}

async function deleteBook(id) {
    // Use a custom non-blocking confirmation or just proceed for now to fix the "wonky" behavior
    // Ideally we'd use a custom modal for confirmation too, but for now let's trust the user clicked delete.
    // if (!confirm('Are you sure you want to delete this book from your list?')) return;

    try {
        modalDeleteBtn.textContent = 'Deleting...';
        modalDeleteBtn.disabled = true;

        const numericId = Number(id);
        if (isNaN(numericId)) {
            throw new Error(`Invalid book ID: ${id}`);
        }
        console.log(`Attempting to delete book with ID: ${numericId}`);

        const { error } = await supabase
            .from('book_club_list')
            .delete()
            .eq('id', numericId);

        if (error) throw error;

        // Refresh list and close
        await fetchSavedBooks();
        closeModal();

    } catch (error) {
        console.error('Error deleting book:', error);
        showError(`Failed to delete book. ${error.message || ''}`);
        modalDeleteBtn.textContent = 'Delete';
        modalDeleteBtn.disabled = false;
    }
}

// --- Tag Management Logic ---

function updateTagSuggestions() {
    const tags = new Set();
    allSavedBooks.forEach(book => {
        if (book.tags) {
            book.tags.forEach(t => tags.add(t));
        }
    });

    tagSuggestions.innerHTML = '';
    Array.from(tags).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        tagSuggestions.appendChild(option);
    });
}

// See More Button
seeMoreBtn.addEventListener('click', () => {
    modalDescriptionContainer.classList.toggle('line-clamp-3');
    seeMoreBtn.textContent = modalDescriptionContainer.classList.contains('line-clamp-3') ? 'See more' : 'See less';
});

function renderModalTags() {
    modalTagsContainer.innerHTML = '';
    currentModalTags
        .filter(tag => tag.toLowerCase() !== 'read') // Ensure "Read" is never shown as a tag
        .forEach(tag => {
            const chip = document.createElement('span');
            chip.className = `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColor(tag)}`;
            chip.innerHTML = `
            ${tag}
            <button type="button" class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition focus:outline-none" onclick="removeTagFromModal('${tag}')">
                <span class="sr-only">Remove ${tag}</span>
                <iconify-icon icon="solar:close-circle-broken" class="text-xs"></iconify-icon>
            </button>
        `;
            modalTagsContainer.appendChild(chip);
        });
}

function addTagToModal() {
    const val = addTagInput.value.trim();
    if (val && !currentModalTags.includes(val)) {
        currentModalTags.push(val);
        renderModalTags();
        addTagInput.value = '';
    }
}

// Expose to window for onclick
window.removeTagFromModal = function (tag) {
    currentModalTags = currentModalTags.filter(t => t !== tag);
    renderModalTags();
};

addTagBtn.addEventListener('click', addTagToModal);
addTagInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTagToModal();
    }
});

async function removeTagFromCard(e, bookId, tag) {
    e.stopPropagation(); // Prevent modal open
    if (!confirm(`Remove tag "${tag}"?`)) return;

    // bookId comes from HTML attribute as string, but data ID is number
    const book = allSavedBooks.find(b => b.id == bookId);
    if (!book) {
        console.error('Book not found for tag removal', bookId);
        return;
    }

    const newTags = (book.tags || []).filter(t => t !== tag);

    const { error } = await supabase
        .from('book_club_list')
        .update({ tags: newTags })
        .eq('id', bookId);

    if (error) {
        console.error('Error removing tag:', error);
        showError('Failed to remove tag.');
    } else {
        fetchSavedBooks();
    }
}
// Expose for inline onclick
window.removeTagFromCard = removeTagFromCard;


// --- Import Logic ---

importBtn.addEventListener('click', () => {
    importModal.classList.remove('hidden');
    importText.value = '';
    importProgress.classList.add('hidden');
    startImportBtn.disabled = false;
    startImportBtn.textContent = 'Start Import';
});

const closeImport = () => {
    importModal.classList.add('hidden');
    // Reset state
    importText.value = '';
    importText.classList.remove('hidden'); // Show input again
    importInstructions.classList.remove('hidden'); // Show instructions again
    importProgress.classList.add('hidden');
    importReviewSection.classList.add('hidden');
    importAutoSummary.classList.add('hidden');
    startImportBtn.classList.remove('hidden');
    saveImportBtn.classList.add('hidden');
    cancelImportBtn.classList.remove('hidden');
    importCandidates = [];
    autoImported = [];
};
closeImportBtn.addEventListener('click', closeImport);
cancelImportBtn.addEventListener('click', closeImport);

startImportBtn.addEventListener('click', async () => {
    const lines = importText.value.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return;

    startImportBtn.classList.add('hidden'); // Hide start button
    importText.classList.add('hidden'); // Hide input to save space
    importInstructions.classList.add('hidden'); // Hide instructions to save space
    importProgress.classList.remove('hidden');

    // Reset if starting fresh text import (Vision might append, but text usually resets)
    importCandidates = [];
    autoImported = [];

    await searchAndQueueBooks(lines);
});

// Helper: Check if a result is relevant to the query
function isResultRelevant(resultTitle, queryTitle) {
    const normalize = (s) => s.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);
    const qTokens = normalize(queryTitle);
    const rTokens = normalize(resultTitle);
    if (qTokens.length === 0 || rTokens.length === 0) return false;

    const overlap = qTokens.filter(t => rTokens.some(r => r.includes(t) || t.includes(r))).length;
    return overlap >= Math.min(2, qTokens.length * 0.5);
}

// Helper: Smart search with fallback strategies
async function smartBookSearch(title, author, apiKey) {
    const searches = [];

    // Strategy 1: Title + Author (if provided)
    if (author) {
        const firstAuthor = author.split(/\s+and\s+/i)[0].trim();
        searches.push({
            label: 'title+author',
            url: `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title + ' inauthor:' + firstAuthor)}&langRestrict=en&maxResults=10&key=${apiKey}`
        });
    }

    // Strategy 2: Title only (in case author is causing issues)
    searches.push({
        label: 'title-only',
        url: `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&langRestrict=en&maxResults=10&key=${apiKey}`
    });

    // Strategy 3: Fuzzy title (remove apostrophes, common endings)
    const fuzzyTitle = title.replace(/['']/g, '').replace(/s\s/g, ' ');
    if (fuzzyTitle !== title) {
        searches.push({
            label: 'fuzzy-title',
            url: `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(fuzzyTitle)}&langRestrict=en&maxResults=10&key=${apiKey}`
        });
    }

    // Try each search strategy until we get relevant results
    for (const search of searches) {
        try {
            await new Promise(r => setTimeout(r, 200)); // Rate limit
            const res = await fetch(search.url);
            const data = await res.json();

            if (data.items && data.items.length > 0) {
                // Filter to only relevant results
                const relevant = data.items.filter(item =>
                    isResultRelevant(item.volumeInfo?.title || '', title)
                );

                if (relevant.length > 0) {
                    return { items: relevant, strategy: search.label };
                }
            }
        } catch (e) {
            console.warn(`Search strategy ${search.label} failed:`, e);
        }
    }

    // No relevant results found with any strategy
    return { items: [], strategy: 'none' };
}

// Reusable Search Function (Text & Vision)
async function searchAndQueueBooks(queries) {
    if (!queries || queries.length === 0) return;

    const importBar = document.getElementById('import-bar');
    const importStatus = document.getElementById('import-status');

    for (let i = 0; i < queries.length; i++) {
        // Strip leading numbers (e.g. "1. Title" -> "Title")
        let query = queries[i].replace(/^\d+\.?\s*/, '').trim();

        // === ENHANCED INPUT CLEANING ===
        // Strip parenthetical notes: (This is the book...), (new), etc.
        query = query.replace(/\s*\([^)]*\)\s*/g, ' ').trim();

        // Capture Goodreads rating before stripping (if present)
        let inputRating = null;
        const ratingMatch = query.match(/[-–—]?\s*(\d+\.\d+)\s*Goodreads\s*$/i);
        if (ratingMatch) {
            inputRating = parseFloat(ratingMatch[1]);
        }
        // Strip trailing Goodreads ratings: "4.22 Goodreads" or "- 4.07 Goodreads"
        query = query.replace(/[-–—]?\s*\d+\.\d+\s*Goodreads\s*$/i, '').trim();
        // Strip trailing "(new)" that might not have been caught
        query = query.replace(/\s*\(new\)\s*$/i, '').trim();

        // Smart Filter: Ignore empty lines, short lines, or instructional text
        if (!query || query.length < 3 || query.toLowerCase().includes('here they are')) continue;

        const percent = Math.round(((i + 1) / queries.length) * 100);
        importBar.style.width = `${percent}%`;
        importStatus.textContent = `Searching for "${query}"... (${i + 1}/${queries.length})`;

        try {
            // Check for title/author separators
            let searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${GOOGLE_API_KEY}`;
            let title = query;
            let author = '';

            // Check for " by " first (more reliable than dash)
            const byRegex = /\s+by\s+/i;
            // Check for "Title - Author" format (handling Hyphen, En Dash, Em Dash)
            const dashRegex = /\s+[–—−-]\s+/;

            // PREFER " by " over dash (dash might be part of subtitle)
            if (byRegex.test(query)) {
                // Use " by " separator - find LAST occurrence
                const lastByIndex = query.toLowerCase().lastIndexOf(' by ');
                if (lastByIndex > 0) {
                    title = query.substring(0, lastByIndex).trim();
                    author = query.substring(lastByIndex + 4).trim();
                }
            } else if (dashRegex.test(query)) {
                // Fallback to dash separator only if no " by "
                const parts = query.split(dashRegex);
                if (parts.length >= 2) {
                    // Use LAST dash part as author (handles "Title - Subtitle - Author")
                    title = parts.slice(0, -1).join(' - ').trim();
                    author = parts[parts.length - 1].trim();
                }
            }

            // Use smart search with fallback strategies and relevance filtering
            const searchResult = await smartBookSearch(title, author, GOOGLE_API_KEY);

            if (searchResult.items && searchResult.items.length > 0) {
                // Use filtered relevant results
                const data = { items: searchResult.items };
                // Phase 1: Filter junk results (using shared function)
                const cleanItems = data.items.filter(item => !isJunkBook(item));
                const itemsToProcess = cleanItems.length > 0 ? cleanItems : data.items;

                // Phase 3: Score by title relevance
                const normalize = (str) => (str || '').toLowerCase().replace(/^(the|a|an)\s+/i, '').replace(/[^a-z0-9\s]/g, '').trim();
                const queryNorm = normalize(title);

                const scoredItems = itemsToProcess.map(item => {
                    const resultNorm = normalize(item.volumeInfo.title);
                    // Stopwords: common words that shouldn't count for matching
                    const stopwords = ['book', 'books', 'novel', 'story', 'stories', 'tale', 'tales', 'of', 'and', 'in', 'for', 'to'];
                    const queryWords = queryNorm.split(/\s+/).filter(w => w.length > 1 && !stopwords.includes(w));
                    const matchCount = queryWords.filter(qw => resultNorm.includes(qw)).length;
                    const score = queryWords.length > 0 ? matchCount / queryWords.length : 0;
                    // Bonus for having image (for sorting only)
                    const imageBonus = item.volumeInfo.imageLinks ? 0.1 : 0;
                    return { item, score: score + imageBonus, matchCount };
                });

                // Sort by relevance (best first)
                scoredItems.sort((a, b) => b.score - a.score);

                // Filter: remove results with ZERO title word overlap
                // Check matchCount, not score (score includes imageBonus)
                const relevantItems = scoredItems.filter(r => r.matchCount > 0);
                const itemsToUse = relevantItems.length > 0 ? relevantItems : scoredItems.slice(0, 1);

                // Dedupe by title+author
                const uniqueResults = [];
                const seenKeys = new Set();
                for (const { item } of itemsToUse) {
                    const info = item.volumeInfo;
                    if (!info.title) continue;
                    const key = (info.title.toLowerCase().trim()) + '|' + (info.authors ? info.authors[0].toLowerCase().trim() : '');
                    if (!seenKeys.has(key)) {
                        seenKeys.add(key);
                        uniqueResults.push(item);
                    }
                    if (uniqueResults.length >= 3) break;
                }

                const finalResults = uniqueResults;
                data.items = finalResults;

                // Check for TOKEN MATCH (Auto-Import)
                // Check for TOKEN MATCH (Auto-Import)
                const firstBook = data.items[0];
                const info = firstBook.volumeInfo;

                const tokenize = (str) => {
                    const stopwords = ['the', 'a', 'an', 'and', 'of', 'in', 'for', 'to', 'with', 'by', 'on', 'at'];
                    return str ? str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(t => t.length > 1 && !stopwords.includes(t)) : [];
                };
                const qTokens = tokenize(title);
                const rTokens = tokenize(info.title);

                // Title Match: More lenient for long titles/subtitles
                let matchTitle = false;
                if (qTokens.length > 0 && rTokens.length > 0) {
                    const overlap = qTokens.filter(t => rTokens.includes(t)).length;
                    const overlapRev = rTokens.filter(t => qTokens.includes(t)).length;

                    // High overlap in either direction (e.g. Subtitle included or omitted)
                    const score = Math.max(overlap / qTokens.length, overlapRev / rTokens.length);

                    // Match if 80% overlap OR first 2 significant words match exactly
                    const firstMatch = qTokens.slice(0, 2).every(t => rTokens.includes(t));
                    matchTitle = (score >= 0.8) || (score >= 0.5 && firstMatch);
                }

                // Author Match: Check if query author overlaps with result authors
                // More lenient - allows partial match for multiple authors
                const qAuthorTokens = tokenize(author);
                let matchAuthor = true; // Default true if no author provided
                if (author && qAuthorTokens.length > 0) {
                    matchAuthor = info.authors && info.authors.some(a => {
                        const aTokens = tokenize(a);
                        // Check if at least 50% of result author tokens match query
                        // OR if first author name (surname) matches
                        const overlap = aTokens.filter(t => qAuthorTokens.includes(t)).length;
                        const overlapScore = overlap / Math.min(aTokens.length, qAuthorTokens.length);
                        const firstNameMatch = aTokens.length > 0 && qAuthorTokens.includes(aTokens[0]);
                        return overlapScore >= 0.5 || firstNameMatch;
                    });
                }

                // STRICTER AUTO-IMPORT:
                // 1. Must match Title AND Author (if provided).
                // 2. If NO Author provided, Title must be > 1 word to avoid false positives
                // 3. Title match must be strong (not just author match)
                const titleMatchStrong = qTokens.length >= 2 && matchTitle;
                const safeToAuto = titleMatchStrong && matchAuthor;

                if (safeToAuto) {
                    // Token match found! Auto-queue it.
                    // Store inputRating and parsedAuthor if provided in the original input
                    firstBook.inputRating = inputRating;
                    firstBook.parsedAuthor = author;
                    // Pre-generate tags for evaluation
                    firstBook.tempTags = generateTags(firstBook);
                    autoImported.push(firstBook);
                } else {
                    // Ambiguous - add to review list
                    // NO AUTO-SELECT. User must choose.
                    importCandidates.push({
                        query: query,
                        results: data.items,
                        selectedId: null, // Zero Guessing: Force user to pick
                        status: 'ambiguous',
                        inputRating: inputRating,  // Store rating from input
                        parsedAuthor: author,      // Store parsed author for fallback
                        tempTags: data.items.length > 0 ? generateTags(data.items[0]) : '' // Preview tags for first result
                    });
                }
            } else {
                // No results found
                importCandidates.push({
                    query: query,
                    results: [],
                    selectedId: null,
                    status: 'not_found',
                    inputRating: inputRating,
                    parsedAuthor: author
                });
            }
        } catch (err) {
            console.error('Import search error:', err);
            importCandidates.push({
                query: query,
                results: [],
                error: true
            });
        }

        // Small delay
        await new Promise(r => setTimeout(r, 300));
    }

    // Done searching, show review UI
    importProgress.classList.add('hidden');
    renderImportReview();
}

// 2. Fetch More Results (Pagination)
async function fetchMoreResults(queryIndex, currentCount) {
    const candidate = importCandidates[queryIndex];
    if (!candidate) return;

    const btn = document.getElementById(`search-more-${queryIndex}`);
    if (btn) {
        btn.innerHTML = '<iconify-icon icon="line-md:loading-twotone-loop" class="text-lg"></iconify-icon> Searching...';
        btn.disabled = true;
    }

    try {
        // Fetch 5 more results, offset by current count
        const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(candidate.query)}&startIndex=${currentCount}&maxResults=5&key=${GOOGLE_API_KEY}`;

        const res = await fetch(searchUrl);
        const data = await res.json();

        if (data.items && data.items.length > 0) {
            // Append new results, avoiding duplicates
            const newBooks = data.items.filter(newBook =>
                !candidate.results.some(existing => existing.id === newBook.id)
            );

            candidate.results = [...candidate.results, ...newBooks];
        } else {
            // No more results found, maybe show a toast or disable button permanently?
            // For now, just existing logic will re-render and button will remain but produce no new results if clicked again, 
            // or we could hide it. Let's keep specific feedback simple.
        }
    } catch (err) {
        console.error('Fetch more error:', err);
    }

    renderImportReview();
}

// Helpers for the new UI
function removeAutoImport(index) {
    autoImported.splice(index, 1);
    renderImportReview(); // Re-render to update grid/counts
}

function updateAutoTag(index, value) {
    autoImported[index].tempTags = value;
}

function renderImportReview() {
    importReviewSection.classList.remove('hidden');
    importReviewList.innerHTML = '';
    saveImportBtn.classList.remove('hidden');
    saveImportBtn.disabled = false;
    saveImportBtn.textContent = 'Save All Selected';

    // STABLE LAYOUT: Fixed large width
    const modalContainer = document.querySelector('#import-modal > div');
    modalContainer.classList.remove('max-w-lg');
    modalContainer.classList.add('w-11/12', 'max-w-5xl', 'h-[90vh]', 'flex', 'flex-col');

    // Collapse input sections during review to save space (use new tab structure)
    const tabs = document.getElementById('import-tabs');
    const textContent = document.getElementById('tab-content-text');
    const visionContent = document.getElementById('tab-content-vision');
    const instructions = document.getElementById('import-instructions');
    const collapsedBar = document.getElementById('import-collapsed-bar');

    if (tabs) tabs.classList.add('hidden');
    if (textContent) textContent.classList.add('hidden');
    if (visionContent) visionContent.classList.add('hidden');
    if (instructions) instructions.classList.add('hidden');
    if (collapsedBar) collapsedBar.classList.remove('hidden');

    // Make the review list scrollable
    importReviewList.className = 'flex-grow overflow-y-auto min-h-0 pb-8';
    importReviewSection.classList.remove('hidden');
    importReviewSection.classList.add('flex', 'flex-col', 'h-full', 'min-h-0');

    // Combine all items for unified table
    const allItems = [
        ...autoImported.map((book, idx) => ({
            type: 'auto',
            index: idx,
            query: book.volumeInfo.title,
            book: book,
            matchQuality: 'strong',
            selectedId: book.id,
            results: [book],
            parsedAuthor: book.parsedAuthor
        })),
        ...importCandidates.map((item, idx) => ({
            type: 'candidate',
            index: idx,
            query: item.query,
            book: item.results.length > 0 ? item.results.find(b => b.id === item.selectedId) || item.results[0] : null,
            matchQuality: item.results.length === 0 ? 'none' : (item.results.length === 1 ? 'strong' : 'multiple'),
            selectedId: item.selectedId,
            results: item.results,
            status: item.status,
            parsedAuthor: item.parsedAuthor,
            tempTags: item.tempTags // Pass through temp tags
        }))
    ];

    // Summary header
    const summaryHeader = document.createElement('div');
    summaryHeader.className = 'flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200 sticky top-0 z-10';
    const selectedCount = allItems.filter(i => i.selectedId || i.type === 'auto').length;
    summaryHeader.innerHTML = `
        <div class="flex items-center gap-3">
            <iconify-icon icon="solar:book-2-bold-duotone" class="text-2xl text-stone-600"></iconify-icon>
            <div>
                <h4 class="font-bold text-stone-800">Import Review</h4>
                <p class="text-xs text-stone-500">${allItems.length} books found • ${selectedCount} selected</p>
            </div>
        </div>
    `;
    importReviewList.appendChild(summaryHeader);

    // Create table
    const table = document.createElement('table');
    table.className = 'w-full text-sm';

    // Table header - fixed sticky position
    table.innerHTML = `
        <thead class="bg-stone-100 text-left text-xs text-stone-500 uppercase tracking-wider sticky top-[52px] z-10">
            <tr>
                <th class="px-2 py-2 w-8 text-center">
                    <input type="checkbox" id="select-all-import" class="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500" checked>
                </th>
                <th class="px-2 py-2 w-12">Cover</th>
                <th class="px-2 py-2 w-32">Query</th>
                <th class="px-2 py-2 w-56">Title</th>
                <th class="px-2 py-2 w-40">Author</th>
                <th class="px-2 py-2 w-16">Year</th>
                <th class="px-2 py-2 w-16 text-center">Refine</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');
    tbody.className = 'divide-y divide-stone-100';

    allItems.forEach((item, rowIndex) => {
        const row = document.createElement('tr');
        const isSelected = item.selectedId !== null && item.selectedId !== undefined;

        // For auto items, check the 'selected' flag (default true)
        const isAutoSelected = item.type === 'auto' && item.book?.selected !== false;
        const isChecked = item.type === 'auto' ? isAutoSelected : isSelected;

        // Use amber background for unselected rows (needs attention) instead of gray/opacity
        row.className = `${isChecked ? 'bg-green-50' : 'bg-amber-50'} hover:bg-stone-50 transition-colors`;

        const book = item.book;
        const thumb = book?.volumeInfo?.imageLinks?.thumbnail || '';
        const title = book?.volumeInfo?.title || (item.status === 'not_found' ? 'No match found' : 'Unknown Title');

        // Author Fallback: Use parsed author if result has none
        const author = book?.volumeInfo?.authors?.[0] || item.parsedAuthor || 'Unknown';
        const year = book?.volumeInfo?.publishedDate?.substring(0, 4) || '';

        // Match quality indicator - SHOW OPTIONS FOR ALL CANDIDATES WITH RESULTS
        let matchIndicator = '';
        if (item.matchQuality === 'none') {
            // No match - provide Search button to let user try again
            matchIndicator = `<span class="text-red-500 text-[10px]">✗ No match</span>
                <br><button onclick="refineSearch(${rowIndex}, '${item.type}', ${item.index})" class="text-blue-500 text-[10px] hover:underline cursor-pointer">Search</button>`;
        } else if (item.type === 'candidate' && item.results.length > 0) {
            // Show clickable options for ALL candidates with results
            const optionLabel = item.results.length === 1 ? '1 result' : `${item.results.length} options`;
            const color = item.selectedId ? 'text-green-600' : 'text-amber-600 font-medium';
            matchIndicator = `<button onclick="openOptionsForRow(${rowIndex}, '${item.type}', ${item.index})" class="${color} text-[10px] hover:underline cursor-pointer">${optionLabel}</button>`;
            // If unselected, add hint
            if (!item.selectedId) {
                matchIndicator += '<br><span class="text-stone-500 text-[9px]">Click to choose</span>';
            }
        } else if (item.type === 'auto') {
            // Auto-matched - but still clickable to verify
            matchIndicator = `<button onclick="openOptionsForRow(${rowIndex}, '${item.type}', ${item.index})" class="text-green-600 text-[10px] hover:underline cursor-pointer">✓ Auto-matched</button>`;
        }

        // Build cover cell with hover zoom - USE SAME URL, just scale up
        const safeThumb = thumb ? thumb.replace('http:', 'https:') : '';
        const coverCell = thumb
            ? `<td class="px-2 py-2 relative group">
                    <div class="w-9 h-12 bg-stone-100 border border-stone-200 rounded overflow-hidden flex items-center justify-center cursor-pointer">
                        <img src="${safeThumb}" class="max-w-full max-h-full object-contain">
                    </div>
                    <div class="hidden group-hover:flex absolute left-14 top-0 z-50 bg-white p-2 rounded-lg shadow-xl border border-stone-300 items-center justify-center" style="min-width:100px; min-height:120px;">
                        <img src="${safeThumb}" style="max-height: 160px; max-width: 120px;">
                    </div>
               </td>`
            : `<td class="px-2 py-2">
                    <div class="w-9 h-12 bg-stone-100 border border-stone-200 rounded flex items-center justify-center text-stone-400">
                        <iconify-icon icon="solar:book-2-line-duotone" class="text-sm"></iconify-icon>
                    </div>
               </td>`;

        row.innerHTML = `
            <td class="px-2 py-2 text-center">
                <input type="checkbox" 
                    data-row="${rowIndex}" 
                    data-type="${item.type}" 
                    data-index="${item.index}"
                    class="import-row-checkbox w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    ${isChecked ? 'checked' : ''}>
            </td>
            ${coverCell}
            </td>
            <td class="px-2 py-2 max-w-[10rem]">
                <div class="text-xs text-stone-600 line-clamp-2" title="${item.query}">"${item.query}"</div>
                ${matchIndicator}
            </td>
            <td class="px-2 py-2 max-w-[14rem]">
                <p class="font-medium text-stone-800 text-sm line-clamp-2" title="${title}">${title}</p>
            </td>
            <td class="px-2 py-2 max-w-[10rem]">
                <p class="text-stone-600 text-sm line-clamp-2" title="${author}">${author}</p>
            </td>
            <td class="px-2 py-2 text-stone-400 text-sm">${year}</td>
            <td class="px-2 py-2 text-center">
                <button onclick="refineSearch(${rowIndex}, '${item.type}', ${item.index})" 
                    class="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 mx-auto">
                    <iconify-icon icon="solar:pen-new-square-linear"></iconify-icon>
                    Edit
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    importReviewList.appendChild(table);

    // Add checkbox event listeners
    document.querySelectorAll('.import-row-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const type = e.target.dataset.type;
            const index = parseInt(e.target.dataset.index);
            toggleImportRow(type, index, e.target.checked);
        });
    });

    // Select All checkbox
    const selectAllCb = document.getElementById('select-all-import');
    if (selectAllCb) {
        selectAllCb.addEventListener('change', (e) => {
            const checked = e.target.checked;
            document.querySelectorAll('.import-row-checkbox').forEach(cb => {
                cb.checked = checked;
                const type = cb.dataset.type;
                const index = parseInt(cb.dataset.index);
                toggleImportRow(type, index, checked);
            });
        });
    }
}

// Helper functions for table actions
function skipImportRow(rowIndex, type, index) {
    if (type === 'auto') {
        autoImported[index].selected = false;
    } else {
        importCandidates[index].status = 'skipped';
        importCandidates[index].selectedId = null;
    }
    renderImportReview();
}

function unskipImportRow(rowIndex, type, index) {
    if (type === 'auto') {
        autoImported[index].selected = true;
    } else {
        importCandidates[index].status = 'ambiguous';
        // Re-select first result if available
        if (importCandidates[index].results.length > 0) {
            importCandidates[index].selectedId = importCandidates[index].results[0].id;
        }
    }
    renderImportReview();
}

function toggleImportRow(type, index, checked) {
    if (type === 'auto') {
        autoImported[index].selected = checked;
    } else {
        if (checked) {
            // Select first result if available
            if (importCandidates[index].results.length > 0) {
                importCandidates[index].selectedId = importCandidates[index].results[0].id;
                importCandidates[index].status = 'selected';
            }
        } else {
            importCandidates[index].selectedId = null;
            importCandidates[index].status = 'skipped';
        }
    }
    // Re-render the full table to keep state in sync
    renderImportReview();
}

function refineSearch(rowIndex, type, index) {
    // Get the current query
    let currentQuery = '';
    if (type === 'auto') {
        currentQuery = autoImported[index]?.volumeInfo?.title || '';
    } else {
        currentQuery = importCandidates[index]?.query || '';
    }

    // Show custom modal instead of native prompt (window.prompt is auto-dismissed in some browsers)
    showRefineSearchModal(currentQuery, (newQuery) => {
        if (newQuery && newQuery.trim() && newQuery !== currentQuery) {
            researchRow(type, index, newQuery.trim());
        }
    });
}

// Custom modal to replace window.prompt for search refinement
function showRefineSearchModal(currentQuery, onSubmit) {
    // Remove any existing modal
    const existing = document.getElementById('refine-search-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'refine-search-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100]';
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-stone-800 mb-4">Edit Search Query</h3>
            <input type="text" id="refine-query-input" 
                class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                value="${currentQuery.replace(/"/g, '&quot;')}" 
                placeholder="Enter search query...">
            <div class="flex gap-3 mt-4 justify-end">
                <button id="refine-cancel-btn" class="px-4 py-2 text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors">
                    Cancel
                </button>
                <button id="refine-save-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Search
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const input = document.getElementById('refine-query-input');
    const cancelBtn = document.getElementById('refine-cancel-btn');
    const saveBtn = document.getElementById('refine-save-btn');

    // Focus and select input
    input.focus();
    input.select();

    // Close modal function
    const closeModal = () => modal.remove();

    // Cancel button
    cancelBtn.onclick = closeModal;

    // NOTE: Removed click-outside-to-close to prevent accidental dismissal

    // Save button
    saveBtn.onclick = () => {
        const newQuery = input.value;
        closeModal();
        onSubmit(newQuery);
    };

    // Enter key to submit
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            const newQuery = input.value;
            closeModal();
            onSubmit(newQuery);
        } else if (e.key === 'Escape') {
            closeModal();
        }
    };
}

async function researchRow(type, index, newQuery) {
    try {
        // Parse query for title/author
        let title = newQuery;
        let author = '';
        const byRegex = /\s+by\s+/i;
        if (byRegex.test(newQuery)) {
            const lastByIndex = newQuery.toLowerCase().lastIndexOf(' by ');
            if (lastByIndex > 0) {
                title = newQuery.substring(0, lastByIndex).trim();
                author = newQuery.substring(lastByIndex + 4).trim();
            }
        }

        // Use smart search with fallback strategies
        const result = await smartBookSearch(title, author, GOOGLE_API_KEY);

        if (result.items && result.items.length > 0) {
            let targetIndex = index;

            if (type === 'auto') {
                // Move from auto to candidate for review
                const oldBook = autoImported.splice(index, 1)[0];
                targetIndex = importCandidates.length; // New index after push
                importCandidates.push({
                    query: newQuery,
                    results: result.items.slice(0, 5),
                    selectedId: null, // DO NOT AUTO-SELECT - user must choose
                    status: 'ambiguous',
                    // Preserve metadata
                    inputRating: oldBook.inputRating,
                    parsedAuthor: oldBook.parsedAuthor,
                    tempTags: oldBook.tempTags
                });
            } else {
                // Update existing candidate
                importCandidates[index].query = newQuery;
                importCandidates[index].results = result.items.slice(0, 5);
                // DO NOT AUTO-SELECT - user must choose
                // importCandidates[index].selectedId = data.items[0].id;
            }

            // Show options modal for user to choose
            renderImportReview();
            showOptionsModal(result.items.slice(0, 5), targetIndex);
            return; // Don't call renderImportReview again below
        } else {
            alert('No results found for: ' + newQuery + '\n\nTip: Try removing apostrophes, checking spelling, or searching just the title.');
        }
    } catch (err) {
        console.error('Refine search error:', err);
        alert('Search failed. Please try again.');
    }

    renderImportReview();
}

function openOptionsForRow(rowIndex, type, index) {
    // Get the candidate item to show options
    let item;
    if (type === 'auto') {
        item = { results: [autoImported[index]] };
    } else {
        item = importCandidates[index];
    }

    if (!item || !item.results || item.results.length === 0) {
        showSimpleAlert('No options available for this row.');
        return;
    }

    showOptionsModal(item.results, index);
}

// Show custom modal with clickable options
function showOptionsModal(results, candidateIndex) {
    // Remove any existing modal
    const existing = document.getElementById('options-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'options-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100]';

    // Get current query for the refine input
    const currentQuery = importCandidates[candidateIndex]?.query || '';

    const optionsHtml = results.map((r, i) => {
        const title = r.volumeInfo?.title || 'Unknown Title';
        const author = r.volumeInfo?.authors?.[0] || 'Unknown Author';
        const year = r.volumeInfo?.publishedDate?.substring(0, 4) || '';
        const thumb = r.volumeInfo?.imageLinks?.smallThumbnail || '';

        return `
            <button class="option-choice w-full text-left p-3 rounded-lg hover:bg-green-50 border border-stone-200 hover:border-green-500 transition-all flex gap-3 items-center" data-index="${i}">
                ${thumb
                ? `<img src="${thumb.replace('http:', 'https:')}" class="w-10 h-14 object-cover rounded shadow-sm">`
                : `<div class="w-10 h-14 bg-stone-100 rounded flex items-center justify-center text-stone-400"><iconify-icon icon="solar:book-2-line-duotone"></iconify-icon></div>`
            }
                <div class="flex-1 min-w-0">
                    <p class="font-medium text-stone-800 truncate">${title}</p>
                    <p class="text-sm text-stone-500 truncate">${author} ${year ? `(${year})` : ''}</p>
                </div>
            </button>
        `;
    }).join('');

    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 class="text-lg font-semibold text-stone-800 mb-2">Choose the Correct Book</h3>
            <p class="text-xs text-stone-500 mb-4 bg-stone-50 p-2 rounded">
                <span class="font-medium">You searched for:</span> "${currentQuery}"
            </p>
            <div class="flex flex-col gap-2 mb-4">
                ${optionsHtml}
            </div>
            
            <!-- Refine search section -->
            <div class="border-t border-stone-200 pt-4 mt-2">
                <p class="text-sm text-stone-500 mb-2">Not finding the right book? Try a different search:</p>
                <div class="flex gap-2">
                    <input type="text" id="options-refine-input" 
                        class="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        value="${currentQuery.replace(/"/g, '&quot;')}" 
                        placeholder="e.g., Exodus Leon Uris">
                    <button id="options-search-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
                        Search
                    </button>
                </div>
            </div>
            
            <button id="options-cancel-btn" class="mt-4 w-full px-4 py-2 text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors">
                Cancel
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal function
    const closeModal = () => modal.remove();

    // Cancel button
    document.getElementById('options-cancel-btn').onclick = closeModal;

    // NOTE: Removed click-outside-to-close to prevent accidental dismissal

    // Option buttons
    modal.querySelectorAll('.option-choice').forEach(btn => {
        btn.onclick = () => {
            const choiceIndex = parseInt(btn.dataset.index);
            importCandidates[candidateIndex].selectedId = results[choiceIndex].id;
            closeModal();
            renderImportReview();
        };
    });

    // Refine search functionality
    const refineInput = document.getElementById('options-refine-input');
    const searchBtn = document.getElementById('options-search-btn');

    const doRefineSearch = async () => {
        const newQuery = refineInput.value.trim();
        if (!newQuery) return;

        searchBtn.textContent = 'Searching...';
        searchBtn.disabled = true;

        try {
            // Parse query for title/author
            let title = newQuery;
            let author = '';
            const byRegex = /\s+by\s+/i;
            if (byRegex.test(newQuery)) {
                const lastByIndex = newQuery.toLowerCase().lastIndexOf(' by ');
                if (lastByIndex > 0) {
                    title = newQuery.substring(0, lastByIndex).trim();
                    author = newQuery.substring(lastByIndex + 4).trim();
                }
            }

            // Use smart search with fallback strategies
            const result = await smartBookSearch(title, author, GOOGLE_API_KEY);

            if (result.items && result.items.length > 0) {
                // Update the candidate with new results - DO NOT AUTO-SELECT
                importCandidates[candidateIndex].query = newQuery;
                importCandidates[candidateIndex].results = result.items.slice(0, 5);
                // DO NOT set selectedId - user must explicitly choose

                // Refresh the modal with new options - user must click to select
                closeModal();
                showOptionsModal(result.items.slice(0, 5), candidateIndex);
            } else {
                // No relevant results - suggest alternatives
                searchBtn.textContent = 'No match';
                searchBtn.disabled = false;

                // Show helpful tip
                const tipEl = document.getElementById('search-tip');
                if (!tipEl) {
                    const tip = document.createElement('p');
                    tip.id = 'search-tip';
                    tip.className = 'text-xs text-amber-600 mt-2';
                    tip.innerHTML = '💡 Try: removing apostrophes, checking spelling, or just the title without author';
                    refineInput.parentElement.after(tip);
                }
            }
        } catch (err) {
            console.error('Refine search error:', err);
            searchBtn.textContent = 'Error';
            setTimeout(() => {
                searchBtn.textContent = 'Search';
                searchBtn.disabled = false;
            }, 1500);
        }
    };

    searchBtn.onclick = doRefineSearch;
    refineInput.onkeydown = (e) => {
        if (e.key === 'Enter') doRefineSearch();
    };
}

// Simple alert replacement
function showSimpleAlert(message) {
    const existing = document.getElementById('simple-alert-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'simple-alert-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100]';
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <p class="text-stone-800 mb-4">${message}</p>
            <button id="alert-ok-btn" class="w-full px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors">
                OK
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById('alert-ok-btn').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function expandImportInput() {
    // Show tabs and text content, hide collapsed bar AND review section
    const tabs = document.getElementById('import-tabs');
    const textContent = document.getElementById('tab-content-text');
    const visionContent = document.getElementById('tab-content-vision');
    const instructions = document.getElementById('import-instructions');
    const collapsedBar = document.getElementById('import-collapsed-bar');
    const expandedActions = document.getElementById('import-expanded-actions');
    const importText = document.getElementById('import-text');
    const reviewSection = document.getElementById('import-review-section');

    // Clear previous text for fresh input AND ensure textarea is visible
    if (importText) {
        importText.value = '';
        importText.classList.remove('hidden');
    }

    // Hide review table to make room for input
    if (reviewSection) reviewSection.classList.add('hidden');

    // Show tabs and text tab content
    if (tabs) tabs.classList.remove('hidden');
    if (textContent) textContent.classList.remove('hidden');
    if (visionContent) visionContent.classList.add('hidden');
    if (instructions) instructions.classList.remove('hidden');
    if (collapsedBar) collapsedBar.classList.add('hidden');
    if (expandedActions) expandedActions.classList.remove('hidden');

    // Reset tab styling to text tab active
    switchImportTab('text');
}

function collapseImportInput() {
    // Hide tabs and content, show collapsed bar AND review section
    const tabs = document.getElementById('import-tabs');
    const textContent = document.getElementById('tab-content-text');
    const visionContent = document.getElementById('tab-content-vision');
    const instructions = document.getElementById('import-instructions');
    const collapsedBar = document.getElementById('import-collapsed-bar');
    const expandedActions = document.getElementById('import-expanded-actions');
    const reviewSection = document.getElementById('import-review-section');

    if (tabs) tabs.classList.add('hidden');
    if (textContent) textContent.classList.add('hidden');
    if (visionContent) visionContent.classList.add('hidden');
    if (instructions) instructions.classList.add('hidden');
    if (collapsedBar) collapsedBar.classList.remove('hidden');
    if (expandedActions) expandedActions.classList.add('hidden');

    // Restore review table
    if (reviewSection) reviewSection.classList.remove('hidden');
}

function switchImportTab(tabName) {
    const tabText = document.getElementById('tab-text');
    const tabVision = document.getElementById('tab-vision');
    const textContent = document.getElementById('tab-content-text');
    const visionContent = document.getElementById('tab-content-vision');

    // Active tab: bg-white shadow-sm text-stone-800
    // Inactive tab: bg-transparent text-stone-500

    if (tabName === 'text') {
        // Activate text tab
        if (tabText) {
            tabText.classList.add('bg-white', 'shadow-sm', 'text-stone-800');
            tabText.classList.remove('text-stone-500');
        }
        if (tabVision) {
            tabVision.classList.remove('bg-white', 'shadow-sm', 'text-stone-800');
            tabVision.classList.add('text-stone-500');
        }
        if (textContent) textContent.classList.remove('hidden');
        if (visionContent) visionContent.classList.add('hidden');
    } else {
        // Activate vision tab
        if (tabVision) {
            tabVision.classList.add('bg-white', 'shadow-sm', 'text-stone-800');
            tabVision.classList.remove('text-stone-500');
        }
        if (tabText) {
            tabText.classList.remove('bg-white', 'shadow-sm', 'text-stone-800');
            tabText.classList.add('text-stone-500');
        }
        if (visionContent) visionContent.classList.remove('hidden');
        if (textContent) textContent.classList.add('hidden');
    }
}

async function importMoreBooks() {
    const importText = document.getElementById('import-text');
    const text = importText?.value?.trim();

    if (!text) {
        showSimpleAlert('Please enter some book titles first.');
        return;
    }

    // Parse into lines
    const lines = text.split('\n').filter(line => line.trim());

    // Show progress bar BEFORE collapsing
    const progressDiv = document.getElementById('import-progress');
    if (progressDiv) progressDiv.classList.remove('hidden');

    // Collapse the input
    collapseImportInput();

    // searchAndQueueBooks already handles its own progress updates
    await searchAndQueueBooks(lines);

    // Hide progress and show review
    if (progressDiv) progressDiv.classList.add('hidden');
    renderImportReview();
}

saveImportBtn.addEventListener('click', async () => {
    // Explicitly check session on click to prevent race conditions
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData?.session?.user;

    console.log('Save clicked. Current User:', currentUser);

    if (!currentUser) {
        alert('You must be logged in to save books. Please reload or log in again.');
        saveImportBtn.textContent = 'Save Selected';
        saveImportBtn.disabled = false;
        return;
    }
    saveImportBtn.textContent = 'Saving...';
    saveImportBtn.disabled = true;

    const booksToSave = [];

    // 1. Auto-imported (Filter by Selected)
    autoImported.forEach(book => {
        // Respect explicit selection (default true)
        if (book.selected === false) return;

        // Use tempTags if available (from edit), else fallback to fresh generate
        const tagsString = book.tempTags !== undefined ? book.tempTags : generateTags(book);
        const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);

        booksToSave.push({
            title: book.volumeInfo.title,
            author: (book.volumeInfo.authors || [book.parsedAuthor || 'Unknown']).join(', '),
            google_data: book,
            tags: tags,
            // Use inputRating if provided in original input (Goodreads rating)
            rating: book.inputRating || null
        });
    });

    // 2. Candidates
    importCandidates.forEach(item => {
        // Skip if no selection or explicitly skipped
        if (!item.selectedId || item.status === 'skipped') return;

        const book = item.results.find(b => b.id === item.selectedId);
        if (book) {
            // Use tempTags from the item wrapper (where input bound to)
            // Note: In render, we stored it on item.tempTags
            const tagsString = item.tempTags !== undefined ? item.tempTags : generateTags(book);
            const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);

            booksToSave.push({
                title: book.volumeInfo.title,
                author: (book.volumeInfo.authors || [item.parsedAuthor || 'Unknown']).join(', '),
                google_data: book,
                tags: tags,
                // Use inputRating if provided in original input (Goodreads rating)
                rating: item.inputRating || null
            });
        }
    });

    if (booksToSave.length === 0) {
        showError('No books selected to save.');
        saveImportBtn.textContent = 'Save Selected';
        saveImportBtn.disabled = false;
        return;
    }

    // --- Fetch Goodreads Ratings ---
    // Only fetch for books that don't already have a rating
    for (let i = 0; i < booksToSave.length; i++) {
        const book = booksToSave[i];
        saveImportBtn.textContent = `Fetching Ratings (${i + 1}/${booksToSave.length})...`;

        // Skip if already has a rating from input
        if (book.rating) {
            book.rating_source = 'manual';
            continue;
        }

        // Try to get Goodreads rating
        const isbn = book.google_data?.volumeInfo?.industryIdentifiers?.find(
            id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
        )?.identifier;

        const grRating = await getGoodreadsRating(isbn, book.title, book.author);

        if (grRating) {
            book.rating = parseFloat(grRating.rating);
            book.rating_source = 'goodreads';
            book.rating_count = grRating.count;
        } else {
            // Fallback to OpenLibrary if Goodreads fails
            const olRating = await getOpenLibraryRating(isbn, book.title, book.author);
            if (olRating && olRating.count > 50) {
                book.rating = parseFloat(olRating.average);
                book.rating_source = 'openlibrary';
                book.rating_count = olRating.count;
            }
        }

        // Small delay to avoid rate limiting
        if (i < booksToSave.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    saveImportBtn.textContent = 'Saving...';

    const { error } = await supabase
        .from('book_club_list')
        .insert(booksToSave);

    if (error) {
        console.error('Error saving imported books:', error);
        showError('Failed to save books.');
        saveImportBtn.textContent = 'Save Selected';
        saveImportBtn.disabled = false;
    } else {
        showSection('library');
        fetchSavedBooks();
        // Reset and Close
        importText.value = '';
        importReviewSection.classList.add('hidden');
        importModal.classList.add('hidden');
        saveImportBtn.textContent = 'Save Selected';
        saveImportBtn.disabled = false;
        // Clear data
        importCandidates = [];
        autoImported = [];
    }
});

// --- Saved Books Logic ---

let currentView = 'grid'; // 'grid' or 'table'


refreshSavedBtn.addEventListener('click', fetchSavedBooks);

viewGridBtn.addEventListener('click', () => switchView('grid'));
viewTableBtn.addEventListener('click', () => switchView('table'));

// Filter Listeners
// filterStatus listener removed
// filterYear listener removed
filterTag.addEventListener('change', applyFilters);
filterRating.addEventListener('change', applyFilters);
sortBy.addEventListener('change', applyFilters);

function switchView(view) {
    currentView = view;
    if (view === 'grid') {
        savedGrid.classList.remove('hidden');
        savedTableContainer.classList.add('hidden');
        viewGridBtn.classList.add('bg-white', 'text-stone-800', 'shadow-sm');
        viewGridBtn.classList.remove('text-stone-500');
        viewTableBtn.classList.remove('bg-white', 'text-stone-800', 'shadow-sm');
        viewTableBtn.classList.add('text-stone-500');
    } else {
        savedGrid.classList.add('hidden');
        savedTableContainer.classList.remove('hidden');
        viewTableBtn.classList.add('bg-white', 'text-stone-800', 'shadow-sm');
        viewTableBtn.classList.remove('text-stone-500');
        viewGridBtn.classList.remove('bg-white', 'text-stone-800', 'shadow-sm');
        viewGridBtn.classList.add('text-stone-500');
    }
    // Re-render
    applyFilters();
}

async function fetchSavedBooks() {
    if (!user) return;

    refreshSavedBtn.textContent = 'Loading...';
    refreshSavedBtn.disabled = true;

    const { data, error } = await supabase
        .from('book_club_list')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching saved books:', error);
        showError('Could not load your book list.');
    } else {
        allSavedBooks = data || [];

        // Frontend "Migration": Rename long tags for display
        allSavedBooks.forEach(book => {
            if (book.tags && Array.isArray(book.tags)) {
                book.tags = book.tags.map(t => t === 'Business & Economics' ? 'Business/Econ' : t);
            }
        });

        savedBookIds = new Set(allSavedBooks.map(b => b.google_data.id));

        // Sync statuses based on dates
        await syncBookStatuses(allSavedBooks);

        updateYearFilterOptions();
        updateTagFilterOptions();
        applyFilters();
        renderDashboard(); // Also update dashboard when books are fetched
    }

    refreshSavedBtn.textContent = 'Refresh';
    refreshSavedBtn.disabled = false;
}

function updateYearFilterOptions() {
    if (!filterYearMenu) return;

    const years = new Set();
    // Always include current year and next 2 years
    const currentYear = new Date().getFullYear();
    years.add(String(currentYear));
    years.add(String(currentYear + 1));
    years.add(String(currentYear + 2));

    allSavedBooks.forEach(book => {
        if (book.target_date) {
            years.add(book.target_date.substring(0, 4));
        }
    });

    filterYearMenu.innerHTML = '';

    // "All Years" Option
    const allBtn = document.createElement('button');
    allBtn.className = 'w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-rose-600 transition font-medium';
    allBtn.textContent = 'All Years';
    allBtn.onclick = () => {
        currentYearFilter = 'all';
        filterYearLabel.textContent = 'All Years';
        applyFilters();
        filterYearMenu.classList.add('hidden');
        updateActiveYearState();
    };
    filterYearMenu.appendChild(allBtn);

    const divider = document.createElement('div');
    divider.className = 'h-px bg-stone-100 my-1';
    filterYearMenu.appendChild(divider);

    Array.from(years).sort().reverse().forEach(year => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-rose-600 transition';
        btn.textContent = year;
        btn.onclick = () => {
            currentYearFilter = year;
            filterYearLabel.textContent = year;
            applyFilters();
            filterYearMenu.classList.add('hidden');
            updateActiveYearState();
        };
        filterYearMenu.appendChild(btn);
    });

    // Reset UI if current filter is no longer valid (optional safety)
    updateActiveYearState();
}

function updateActiveYearState() {
    if (!filterYearMenu) return;
    const buttons = filterYearMenu.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('text-rose-600', 'bg-stone-50');
        // Match label content to filter state
        if ((currentYearFilter === 'all' && btn.textContent === 'All Years') ||
            (btn.textContent === currentYearFilter)) {
            btn.classList.add('text-rose-600', 'bg-stone-50');
        }
    });
}

function updateTagFilterOptions() {
    const tags = new Set();
    allSavedBooks.forEach(book => {
        if (book.tags) {
            book.tags.forEach(t => tags.add(t));
        }
    });

    const currentVal = filterTag.value;
    filterTag.innerHTML = '<option value="all">All Tags</option>';
    Array.from(tags).sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        filterTag.appendChild(option);
    });
    if (tags.has(currentVal)) filterTag.value = currentVal;
}

function applyFilters() {
    let filtered = [...allSavedBooks];

    // 0. Filter Test Data (Global)
    if (!showTestData) {
        filtered = filtered.filter(b => b.status !== 'Test');
    }

    // 1. Filter by Status
    const statusVal = currentStatusFilter;
    if (statusVal !== 'all') {
        if (statusVal === 'Saved') {
            // Match null, empty, or explicit 'Saved' (though we use null for default)
            filtered = filtered.filter(b => !b.status || b.status === 'Saved');
        } else {
            filtered = filtered.filter(b => b.status === statusVal);
        }
    }

    // 2. Filter by Year
    const yearVal = currentYearFilter;
    if (yearVal !== 'all') {
        filtered = filtered.filter(b => {
            if (!b.target_date) return false;
            return b.target_date.startsWith(yearVal);
        });
    }

    // 3. Filter by Tag
    const tagVal = filterTag.value;
    if (tagVal !== 'all') {
        filtered = filtered.filter(b => b.tags && b.tags.includes(tagVal));
    }

    // 4. Filter by Rating
    const ratingVal = filterRating.value;
    if (ratingVal !== 'all') {
        filtered = filtered.filter(b => {
            const r = b.rating;
            // Unrated (null, undefined, 0)
            if (ratingVal === 'unrated') return !r;

            // If book has no rating but we are filtering for a specific range, exclude it
            if (!r) return false;

            const val = parseFloat(r);
            if (ratingVal === '4.5') return val >= 4.5;
            if (ratingVal === '4.0') return val >= 4.0 && val < 4.5;
            if (ratingVal === '3.5') return val >= 3.5 && val < 4.0;
            if (ratingVal === 'under3.5') return val < 3.5;

            return true;
        });
    }

    // 4. Sort
    const sortVal = sortBy.value;
    filtered.sort((a, b) => {
        switch (sortVal) {
            case 'newest':
                return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
                return new Date(a.created_at) - new Date(b.created_at);
            case 'scheduled':
                // Sort by target_date ascending (Earliest date first)
                // Books with dates come first, nulls pushed to bottom
                const dateA = a.target_date || '9999-12-31';
                const dateB = b.target_date || '9999-12-31';
                if (dateA === dateB) return 0;
                return dateA < dateB ? -1 : 1;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'title':
                return (a.title || '').localeCompare(b.title || '');
            case 'author':
                return (a.author || '').localeCompare(b.author || '');
            default:
                return 0;
        }
    });

    renderSavedBooks(filtered);
}

function showSection(sectionName) {
    // Hide all sections
    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('library-section').classList.add('hidden');
    dashboardSection.classList.add('hidden');

    // Always hide search results when leaving search
    if (sectionName !== 'search') {
        resultsContainer.classList.add('hidden');
    }

    // Show target
    if (sectionName === 'search') {
        document.getElementById('search-section').classList.remove('hidden');
    } else if (sectionName === 'library') {
        document.getElementById('library-section').classList.remove('hidden');
        applyFilters(); // Call applyFilters to render with current filters
    } else if (sectionName === 'dashboard') {
        dashboardSection.classList.remove('hidden');
        renderDashboard();
    }
}

// Handle Navigation Links (only internal section links, not external links)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    // Skip external links that open in new tabs
    if (anchor.getAttribute('target') === '_blank') return;

    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);

        if (targetId === 'dashboard-section') showSection('dashboard');
        if (targetId === 'search-section') showSection('search');
        if (targetId === 'library-section') showSection('library');
    });
});

// --- Export / Backup Logic ---

if (exportBtn) {
    exportBtn.addEventListener('click', exportLibrary);
}

async function exportLibrary() {
    if (!user) {
        showError('You must be logged in to backup your library.');
        return;
    }

    try {
        const originalText = exportBtn.textContent;
        exportBtn.textContent = 'Backing up...';
        exportBtn.disabled = true;

        // Fetch ALL data from the single source of truth
        const { data, error } = await supabase
            .from('book_club_list')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        const now = new Date();
        const timestamp = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '-' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0');
        const filename = `book-club-backup-${timestamp}.json`;

        // Wrap data in an envelope with metadata
        const exportObject = {
            metadata: {
                version: 1,
                exported_at: now.toISOString(),
                count: data.length,
                source: 'Book Club Companion'
            },
            books: data
        };

        // UI Reset
        exportBtn.textContent = 'Backup Saved!';
        setTimeout(() => {
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
        }, 1000);

        // Show Options Modal instead of just downloading
        showBackupOptionsModal(exportObject, filename);

    } catch (err) {
        console.error('Export failed:', err);
        showError('Backup failed: ' + err.message);
        exportBtn.textContent = 'Backup';
        exportBtn.disabled = false;
    }
}

function showBackupOptionsModal(data, filename) {
    // Remove existing
    const existing = document.getElementById('backup-options-modal');
    if (existing) existing.remove();

    const jsonStr = JSON.stringify(data, null, 2);
    const sizeKB = (new Blob([jsonStr]).size / 1024).toFixed(1);

    const modal = document.createElement('div');
    modal.id = 'backup-options-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[110]';
    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div class="flex items-center gap-3 mb-4 text-green-700">
                <iconify-icon icon="solar:shield-check-bold" class="text-2xl"></iconify-icon>
                <h3 class="text-lg font-bold">Backup Ready</h3>
            </div>
            
            <p class="text-stone-600 text-sm mb-6">
                Your library (${data.books.length} books, ${sizeKB}KB) has been prepared.
                <br><br>
                Because browser downloads can be finicky, you can also copy the data directly.
            </p>

            <div class="flex flex-col gap-3">
                <button id="backup-download-btn" class="w-full btn-primary flex items-center justify-center gap-2">
                    <iconify-icon icon="solar:download-bold-duotone"></iconify-icon>
                    Download File
                </button>
                
                <button id="backup-copy-btn" class="w-full bg-stone-100 text-stone-700 hover:bg-stone-200 py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2 border border-stone-200">
                    <iconify-icon icon="solar:copy-bold-duotone"></iconify-icon>
                    Copy to Clipboard
                </button>

                <button id="backup-close-btn" class="mt-2 text-xs text-stone-500 hover:text-stone-800 underline">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();

    // Download Action
    document.getElementById('backup-download-btn').onclick = async () => {
        const btn = document.getElementById('backup-download-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<iconify-icon icon="line-md:loading-twotone-loop"></iconify-icon> Saving...`;
        btn.disabled = true;

        try {
            await downloadJSON(data, filename);
            btn.innerHTML = `<iconify-icon icon="solar:check-circle-bold"></iconify-icon> Saved`;
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        } catch (err) {
            console.error('Download error:', err);
            btn.innerHTML = `<iconify-icon icon="solar:danger-circle-bold"></iconify-icon> Error`;
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 2000);
        }
    };

    // Copy Action
    const copyBtn = document.getElementById('backup-copy-btn');
    copyBtn.onclick = async () => {
        try {
            await navigator.clipboard.writeText(jsonStr);
            copyBtn.innerHTML = `<iconify-icon icon="solar:check-circle-bold" class="text-green-600"></iconify-icon> Copied!`;
            copyBtn.classList.add('bg-green-50', 'text-green-700', 'border-green-200');
            setTimeout(() => {
                copyBtn.innerHTML = `<iconify-icon icon="solar:copy-bold-duotone"></iconify-icon> Copy to Clipboard`;
                copyBtn.classList.remove('bg-green-50', 'text-green-700', 'border-green-200');
            }, 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            copyBtn.textContent = 'Copy Failed (Check Permissions)';
        }
    };

    document.getElementById('backup-close-btn').onclick = close;
}

async function downloadJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);

    // Method 1: Modern File System Access API ("Save As" Dialog)
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'Book Club JSON',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(jsonStr);
            await writable.close();
            return;
        } catch (err) {
            // If user cancels, stop here (don't fallback to auto-download)
            if (err.name === 'AbortError') return;
            // For other errors, fall through to legacy method
            console.warn('File Picker failed, trying legacy download:', err);
        }
    }

    // Method 2: Legacy Anchor Tag (fallback)
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Standard stability fix
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function renderDashboard() {
    if (!allSavedBooks || allSavedBooks.length === 0) {
        dashboardHero.classList.add('hidden');
        dashboardUpcomingContainer.classList.add('hidden');
        dashboardEmpty.classList.remove('hidden');
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for future books (target_date >= today AND status == 'Scheduled')
    const upcomingBooks = allSavedBooks.filter(book => {
        if (book.status !== 'Scheduled') return false;
        if (!book.target_date) return false;
        // Parse date (YYYY-MM-DD)
        const [year, month, day] = book.target_date.split('-').map(Number);
        const bookDate = new Date(year, month - 1, day);
        return bookDate >= today;
    });

    // Sort by date ascending
    upcomingBooks.sort((a, b) => {
        return new Date(a.target_date) - new Date(b.target_date);
    });

    if (upcomingBooks.length === 0) {
        dashboardHero.classList.add('hidden');
        dashboardUpcomingContainer.classList.add('hidden');
        dashboardEmpty.classList.remove('hidden');
        return;
    }

    // Hide empty state
    dashboardEmpty.classList.add('hidden');

    // 1. Render Hero (First Book)
    const nextBook = upcomingBooks[0];
    const nextInfo = nextBook.google_data.volumeInfo;
    const nextDate = new Date(nextBook.target_date + 'T00:00:00'); // Fix timezone issue
    const daysLeft = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

    // Format date nicely (e.g. "October 15, 2025")
    const dateStr = nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    dashboardHero.classList.remove('hidden');

    // Apply container classes directly to dashboardHero to avoid "double card"
    dashboardHero.className = 'max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-row items-center mb-12';

    dashboardHero.innerHTML = `
            <div class="w-1/3 md:w-56 bg-stone-100 flex-shrink-0 border-r border-stone-100 flex items-center justify-center p-4 rounded-l-2xl">
                <img src="${nextInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/300x450?text=No+Cover'}" 
                    alt="${nextInfo.title}" 
                    class="w-full h-auto shadow-md rounded-sm object-contain max-h-full"
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450?text=No+Cover'">
            </div>
            
        <div class="flex-grow p-4 md:p-6 flex flex-col justify-center min-w-0">
            <div class="flex items-center gap-3 mb-2 md:mb-3">
                <span class="bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Next Meeting
                </span>
                <span class="text-xs font-bold text-rose-600 uppercase tracking-wide">
                    ${daysLeft === 0 ? 'Today!' : `In ${daysLeft} days`}
                </span>
            </div>

            <h2 class="font-serif text-xl md:text-3xl font-bold text-stone-900 mb-1 leading-tight line-clamp-2">${nextInfo.title}</h2>
            <p class="text-xs md:text-sm text-stone-500 mb-3 md:mb-5 font-medium truncate">by ${nextInfo.authors ? nextInfo.authors.join(', ') : 'Unknown Author'}</p>

            <div class="flex flex-wrap gap-x-6 gap-y-2 mb-4 md:mb-6 pt-3 md:pt-5 border-t border-stone-100">
                <div>
                    <p class="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-0.5">Date</p>
                    <p class="text-sm md:text-base font-bold text-stone-800">${dateStr}</p>
                </div>
                ${nextBook.host_name ? `
                    <div>
                        <p class="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-0.5">Host</p>
                        <p class="text-sm md:text-base font-bold text-stone-800">${nextBook.host_name}</p>
                    </div>` : ''}
            </div>

            <div class="flex flex-wrap gap-2 md:gap-3 mt-auto pt-2 md:pt-4">
                <button onclick="openModal(allSavedBooks.find(b => b.id === ${nextBook.id}).google_data, allSavedBooks.find(b => b.id === ${nextBook.id}))"
                    class="bg-gradient-to-b from-stone-800 to-stone-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] text-white px-5 py-2.5 rounded-lg hover:from-stone-700 hover:to-stone-800 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 font-bold text-sm tracking-wide">
                    View Details
                </button>

                <button onclick="openDiscussionModal(allSavedBooks.find(b => b.id === ${nextBook.id}))"
                    class="bg-white text-stone-700 border border-stone-200 px-4 py-2.5 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all duration-300 shadow-sm hover:shadow-md font-bold text-sm flex items-center gap-2">
                    <iconify-icon icon="solar:chat-round-dots-broken" class="text-base"></iconify-icon>
                    Guide
                </button>

                <div class="relative">
                    <button onclick="toggleCalendarDropdown(event)" class="bg-white text-stone-700 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all duration-300 shadow-sm hover:shadow-md font-bold text-sm flex items-center gap-2">
                        <iconify-icon icon="solar:calendar-add-broken" class="text-base"></iconify-icon>
                        Add to Calendar
                    </button>
                    <div id="calendar-dropdown" class="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-stone-100 hidden z-10 overflow-hidden">
                        <a href="${generateGoogleCalendarLink(nextInfo.title, nextBook.target_date)}" target="_blank" class="block px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-rose-600 transition text-left border-b border-stone-50">
                            Google Calendar
                        </a>
                        <button onclick="downloadIcsFile('${nextInfo.title.replace(/'/g, "\\'")}', '${nextBook.target_date}')" class="block w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 hover:text-rose-600 transition">
                        Outlook / Apple
                    </button>
                </div>
            </div>
        </div>
            </div >
        </div >
        `;

    // 2. Render Upcoming List (Rest of books)
    const laterBooks = upcomingBooks.slice(1);

    if (laterBooks.length > 0) {
        dashboardUpcomingContainer.classList.remove('hidden');
        dashboardUpcomingList.innerHTML = laterBooks.map(book => {
            const info = book.google_data.volumeInfo;
            const bDate = new Date(book.target_date + 'T00:00:00');
            const bDateStr = bDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const uniqueId = `cal - upcoming - ${book.id} `;
            const thumbnail = info.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/128x196?text=No+Cover';

            return `
        <div class="card-modern flex items-center fade-in group relative">
                    <div class="book-frame-modern w-24 border-r border-stone-200 cursor-pointer" onclick="openModal(allSavedBooks.find(b => b.id === ${book.id}).google_data, allSavedBooks.find(b => b.id === ${book.id}))">
                        <img src="${thumbnail}" alt="${info.title}" class="book-cover-shadow h-auto max-h-full object-contain shadow-sm" onerror="this.onerror=null; this.src='https://via.placeholder.com/128x196?text=No+Cover'">
                    </div>

        <div class="px-5 py-4 flex flex-col justify-center min-w-0 flex-grow">
            <div onclick="openModal(allSavedBooks.find(b => b.id === ${book.id}).google_data, allSavedBooks.find(b => b.id === ${book.id}))" class="cursor-pointer pt-1">
                <p class="text-[10px] font-bold text-rose-600 mb-1.5 uppercase tracking-wide leading-none">${bDateStr}</p>
                <h3 class="font-bold text-stone-900 text-sm leading-snug mb-1 truncate">${info.title}</h3>
                <p class="text-xs text-stone-500 truncate mb-3">${info.authors ? info.authors[0] : 'Unknown'}</p>
            </div>

            <div class="relative">
                <button onclick="event.stopPropagation(); document.getElementById('${uniqueId}').classList.toggle('hidden')"
                    class="text-[10px] bg-stone-50 text-stone-600 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition font-medium flex items-center gap-1 w-fit">
                    <iconify-icon icon="solar:calendar-add-broken" class="text-xs"></iconify-icon>
                    Add to Calendar
                </button>
                <div id="${uniqueId}" class="hidden absolute bottom-full mb-1 left-0 w-40 bg-white rounded-lg shadow-lg border border-stone-100 py-1 z-20">
                    <a href="${generateGoogleCalendarLink(info.title, book.target_date)}" target="_blank"
                        class="block px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 font-medium">
                        Google Calendar
                    </a>
                    <a href="#" onclick="downloadIcsFile('${info.title.replace(/'/g, "\\'")}', '${book.target_date}')"
                                    class="block px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-50 font-medium">
                    Outlook / Apple (.ics)
                </a>
            </div>
        </div>
                    </div >
                </div >
        `;
        }).join('');
    } else {
        dashboardUpcomingContainer.classList.add('hidden');
    }
}

function renderSavedBooks(books) {
    savedGrid.innerHTML = '';
    savedTableBody.innerHTML = '';

    if (books.length === 0) {
        savedGrid.innerHTML = '<p class="text-center col-span-full text-stone-500 py-10">No books found matching your filters.</p>';
        savedTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-stone-500">No books found.</td></tr>';
        return;
    }

    // Helper for status colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'Priority': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'Possible': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Later': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Deprioritize': return 'bg-stone-100 text-stone-600 border-stone-200';
            case 'Read': return 'bg-green-100 text-green-800 border-green-200';
            case 'Proposed': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Scheduled': return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'Test': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-stone-50 text-stone-600 border-stone-200'; // Saved/Backlog
        }
    };

    // Helper for tag colors (Notion-like)
    const getTagColor = (tag) => {
        const colors = [
            'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-amber-100 text-amber-700',
            'bg-green-100 text-green-700', 'bg-emerald-100 text-emerald-700', 'bg-teal-100 text-teal-700',
            'bg-cyan-100 text-cyan-700', 'bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700',
            'bg-violet-100 text-violet-700', 'bg-purple-100 text-purple-700', 'bg-fuchsia-100 text-fuchsia-700',
            'bg-pink-100 text-pink-700', 'bg-rose-100 text-rose-700'
        ];
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };
    // Expose for modal
    window.getTagColor = getTagColor;

    books.forEach(row => {
        const info = row.google_data.volumeInfo;
        const thumbnail = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover';
        const authors = info.authors ? info.authors.join(', ') : 'Unknown';
        const status = row.status || 'Saved';
        const statusClass = getStatusColor(status);
        const rating = row.rating ? `★ ${row.rating} ` : '-';
        const date = row.target_date || '-';
        // Derive club year from target_date
        const clubYear = row.target_date ? row.target_date.split('-')[0] : '-';
        const host = row.host_name || '-';

        // --- Grid View Card ---
        const card = document.createElement('div');
        card.className = 'card-modern flex flex-row items-center h-full fade-in group relative';

        // Tags Badge - Filter out "Read" (it's a status) and duplicates (robust comparison)
        const visibleTags = row.tags ? row.tags.filter(t => t.trim().toLowerCase() !== 'read' && t.trim().toLowerCase() !== status.toLowerCase()) : [];
        const tagsHtml = visibleTags.length > 0
            ? `<div class="mt-2 flex flex-wrap gap-1"> ${visibleTags.map(t => `
                <span class="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-medium ${getTagColor(t)} group/tag">
                    ${t}
                    <button onclick="removeTagFromCard(event, '${row.id}', '${t}')" class="ml-1 hidden group-hover/tag:inline-flex hover:text-black/50 items-center justify-center">
                        <iconify-icon icon="solar:close-circle-broken" class="text-[10px]"></iconify-icon>
                    </button>
                </span>`).join('')
            }</div > `
            : '';

        // Status Badge
        const statusHtml = `<span class="text-[10px] px-2 py-0.5 rounded-full border ${statusClass} font-medium"> ${status}</span>`;

        card.innerHTML = `
                <div class="book-frame-modern w-20 md:w-24 border-r border-stone-200 self-stretch">
                    <img src="${thumbnail}" alt="${row.title}" class="book-cover-shadow w-full h-auto max-h-full object-contain shadow-sm" onerror="this.onerror=null; this.src='https://via.placeholder.com/128x192?text=No+Cover'">
                </div>

        <div class="p-3 md:p-4 flex flex-col justify-center min-w-0 flex-grow">
            <div class="flex justify-between items-start">
                <h3 class="font-serif font-bold text-base text-stone-800 leading-tight mb-1 truncate" title="${row.title}">${row.title}</h3>
            </div>
            <p class="text-xs text-stone-600 mb-1 truncate">${authors}</p>

            <div class="flex flex-wrap gap-2 mb-2 items-center">
                ${statusHtml}
                ${(() => {
                if (!row.rating) return '';
                const source = row.rating_source || 'manual';
                const count = row.rating_count;

                // Format count
                let countDisplay = '';
                if (count) {
                    if (count >= 1000000) countDisplay = `(${Math.round(count / 100000) / 10}M)`;
                    else if (count >= 1000) countDisplay = `(${Math.round(count / 1000)}K)`;
                    else countDisplay = `(${count})`;
                }

                // Source Styling
                let badgeClass = 'bg-stone-100 text-stone-600 border-stone-200';
                let icon = '';

                if (source === 'goodreads') {
                    badgeClass = 'bg-[#f4f1ea] text-[#382110] border-[#ece9df]';
                    icon = '<iconify-icon icon="fa6-brands:goodreads" class="mr-1"></iconify-icon>';
                } else if (source === 'openlibrary') {
                    badgeClass = 'bg-blue-50 text-blue-700 border-blue-100';
                    icon = '<iconify-icon icon="fa6-solid:book-open" class="mr-1"></iconify-icon>';
                }

                return `<span class="text-[10px] px-2 py-0.5 rounded-full border ${badgeClass} font-medium flex items-center group/rating" title="Source: ${source}">
                        ${icon} ★ ${row.rating} <span class="ml-1 opacity-60 text-[9px]">${countDisplay}</span>
                    </span>`;
            })()}

                ${(() => {
                if (row.target_date) {
                    // Parse "YYYY-MM-DD" safely
                    const [y, m, d] = row.target_date.split('-').map(Number);
                    const dateObj = new Date(y, m - 1, d);

                    // Format: "Mar 04, 2026"
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const monthName = months[dateObj.getMonth()];
                    const dayStr = String(dateObj.getDate()).padStart(2, '0');
                    const yearStr = dateObj.getFullYear();
                    const formattedDate = `${monthName} ${dayStr}, ${yearStr}`;

                    return `<span class="text-[10px] text-stone-500 flex items-center gap-1 border border-stone-100 px-2 py-0.5 rounded-full bg-stone-50" title="Scheduled Date">
                            <iconify-icon icon="solar:calendar-bold" class="text-stone-400"></iconify-icon> ${formattedDate}
                        </span>`;
                }
                return '';
            })()}
            </div>
            
            ${row.host_name ? `<p class="text-[10px] text-stone-500 mb-1">Host: ${row.host_name}</p>` : ''}
            ${tagsHtml}
            
            <div class="mt-auto pt-2">
               <!-- Spacer -->
            </div>
        </div>
    `;

        // Add AI Click Listener
        if (status === 'Test') {
            // Removed logic
        }

        card.addEventListener('click', () => openModal(row.google_data, row));
        savedGrid.appendChild(card);

        // --- Table View Row ---
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-stone-50 transition cursor-pointer';
        tr.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
                <div class="h-10 w-8 flex-shrink-0">
                    <img class="h-10 w-8 rounded object-cover" src="${thumbnail}" alt="">
                </div>
                <div class="ml-4">
                    <div class="text-sm font-medium text-stone-900 truncate max-w-[200px]" title="${row.title}">${row.title}</div>
                    <div class="text-sm text-stone-500 truncate max-w-[150px]">${authors}</div>
                </div>
            </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusClass}">
                    ${status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                ${rating}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                ${host}
            </td>

            <td class="px-6 py-4 text-sm text-stone-500 max-w-xs">
                <div class="flex flex-wrap gap-1">
                    ${row.tags ? row.tags.map(t => `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColor(t)}">${t}</span>`).join('') : '-'}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                ${date}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                ${new Date(row.created_at).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <!-- Edit button removed -->
            </td>
    `;
        tr.addEventListener('click', () => openModal(row.google_data, row));
        savedTableBody.appendChild(tr);
    });
}

async function saveBook(button, bookData) {
    const info = bookData.volumeInfo;

    button.textContent = 'Saving...';
    button.disabled = true;

    try {
        // Phase 2: Enrich with Open Library Data immediately
        // We define a timeout to prevent hanging if OL is slow
        const olPromise = getOpenLibraryRating(
            info.industryIdentifiers ? info.industryIdentifiers.find(i => i.type === 'ISBN_13')?.identifier : null,
            info.title,
            info.authors ? info.authors[0] : null
        );

        // Wait max 5 seconds for extra data (OL chain can be slow: ISBN -> Work -> Rating)
        const olData = await Promise.race([
            olPromise,
            new Promise(resolve => setTimeout(() => resolve(null), 5000))
        ]);

        // Logic: Prefer Google Rating if > 100 votes. 
        // Else, check Open Library if > 100 votes.
        // Else, leave null.
        let finalRating = null;

        if (info.averageRating && info.ratingsCount > 100) {
            finalRating = info.averageRating;
        } else if (olData && olData.count > 100) {
            finalRating = olData.average;
        }

        const { error } = await supabase
            .from('book_club_list')
            .insert([
                {
                    title: info.title,
                    author: info.authors ? info.authors.join(', ') : 'Unknown',
                    google_data: bookData,
                    tags: generateTags(bookData).split(', ').filter(t => t),
                    rating: finalRating
                }
            ]);

        if (error) throw error;

        button.textContent = 'Saved!';
        button.classList.remove('bg-white', 'text-rose-600', 'border', 'border-rose-200', 'hover:bg-rose-50');
        button.classList.add('bg-green-100', 'text-green-700', 'border-green-200', 'cursor-default');

        // Refresh the saved list and navigate to library
        await fetchSavedBooks();
        closeModal();
        showSection('library'); // Navigate away from search results
        resultsContainer.classList.add('hidden'); // Hide search results

    } catch (err) {
        console.error('Error saving book:', err);
        button.textContent = 'Error';
        showError('Could not save book. Please try again.');
        button.disabled = false;
    }
}

// --- Goodreads Rating via CORS Proxy + Regex parsing ---
// Uses CORS proxy to fetch Goodreads page, then extracts rating using regex

async function getGoodreadsRating(isbn, title, author) {
    try {
        // Construct search query - prefer ISBN, fallback to title+author
        const searchQuery = isbn || `${title} ${author || ''}`.trim();
        const goodreadsUrl = `https://www.goodreads.com/search?q=${encodeURIComponent(searchQuery)}`;

        // Proxy Strategy: Try AllOrigins first, then fallback to CorsProxy
        let htmlContent = null;

        const fetchWithTimeout = async (url, isJson = false) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000); // 5s timeout
            try {
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(id);
                if (!res.ok) throw new Error('Request failed');
                return isJson ? (await res.json()).contents : await res.text();
            } catch (e) {
                clearTimeout(id);
                return null;
            }
        };

        // Attempt 1: AllOrigins
        htmlContent = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(goodreadsUrl)}`, true);

        // Attempt 2: CorsProxy (Fallback)
        if (!htmlContent) {
            console.warn('Goodreads: AllOrigins failed/timed out, trying fallback...');
            htmlContent = await fetchWithTimeout(`https://corsproxy.io/?${encodeURIComponent(goodreadsUrl)}`, false);
        }

        if (!htmlContent) {
            console.error('Goodreads: All proxies failed.');
            return null;
        }

        const html = htmlContent;

        if (!html || html.length < 1000) {
            console.log('No valid HTML from Goodreads proxy');
            return null;
        }

        // Extract rating using regex patterns
        // Goodreads search results show ratings like "3.92 avg rating — 1,234,567 ratings"
        // or in structured data as "ratingValue": "3.92"

        let rating = null;
        let count = null;

        // Pattern 1: Look for "X.XX avg rating — Y ratings" format (handling literal dashes and &mdash;)
        const avgRatingMatch = html.match(/(\d\.\d{1,2})\s*avg\s*rating\s*(?:[—–-]|&mdash;|&#8212;)\s*([\d,]+(?:\.\d+)?)\s*(K|M)?\s*ratings/i);
        if (avgRatingMatch) {
            rating = parseFloat(avgRatingMatch[1]);
            let countStr = avgRatingMatch[2].replace(/,/g, '');
            count = parseFloat(countStr);
            if (avgRatingMatch[3] === 'K') count *= 1000;
            if (avgRatingMatch[3] === 'M') count *= 1000000;
            count = Math.round(count);
        }

        // Pattern 2: Look for structured data (JSON-LD) - usually safe from entities
        if (!rating) {
            const ratingValueMatch = html.match(/"ratingValue"\s*:\s*"?(\d\.\d{1,2})"?/);
            const ratingCountMatch = html.match(/"ratingCount"\s*:\s*"?(\d+)"?/);

            if (ratingValueMatch) {
                rating = parseFloat(ratingValueMatch[1]);
            }
            if (ratingCountMatch) {
                count = parseInt(ratingCountMatch[1]);
            }
        }

        // Pattern 3: Look for minirating format with entity support
        if (!rating) {
            const miniRatingMatch = html.match(/class="[^"]*minirating[^"]*"[^>]*>[^<]*(\d\.\d{1,2})\s*(?:[—–-]|&mdash;|&#8212;)\s*([\d,]+)\s*ratings/i);
            if (miniRatingMatch) {
                rating = parseFloat(miniRatingMatch[1]);
                count = parseInt(miniRatingMatch[2].replace(/,/g, ''));
            }
        }

        // Pattern 4: Look for rating in aria-label or title attributes
        if (!rating) {
            const ariaMatch = html.match(/(?:aria-label|title)="[^"]*(\d\.\d{1,2})\s*(?:out of 5|stars|rating)[^"]*"/i);
            if (ariaMatch) {
                rating = parseFloat(ariaMatch[1]);
            }
        }

        if (rating && rating > 0 && rating <= 5) {
            console.log(`Goodreads parsed: rating=${rating}, count=${count}`);
            return {
                rating: rating.toFixed(2),
                count: count || 0,
                source: 'goodreads'
            };
        }

        console.log('Could not extract rating from Goodreads HTML');
        return null;

    } catch (err) {
        console.error('Error fetching Goodreads rating:', err);
        return null;
    }
}

// Separated for reuse in saveBook
async function getOpenLibraryRating(isbn, title = null, author = null) {
    try {
        let workKey = null;

        // 1. Try ISBN Lookup
        if (isbn) {
            const bookResp = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
            if (bookResp.ok) {
                const bookData = await bookResp.json();
                workKey = bookData.works?.[0]?.key;
            }
        }

        // 2. Fallback: Search by Title/Author if no work key found
        if (!workKey && title) {
            const query = encodeURIComponent(`${title} ${author || ''}`);
            const searchResp = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
            if (searchResp.ok) {
                const searchData = await searchResp.json();
                if (searchData.docs && searchData.docs.length > 0) {
                    workKey = searchData.docs[0].key; // e.g., "/works/OL12345W"
                }
            }
        }

        if (!workKey) return null;

        // 3. Get Ratings
        const ratingResp = await fetch(`https://openlibrary.org${workKey}/ratings.json`);
        if (!ratingResp.ok) return null;
        const ratingData = await ratingResp.json();

        if (ratingData.summary?.average) {
            return {
                average: ratingData.summary.average.toFixed(1),
                count: ratingData.summary.count || 0
            };
        }
        return null;

    } catch (err) {
        console.error('Error fetching OL data:', err);
        return null;
    }
}

async function fetchOpenLibraryRating(isbn, title = null, author = null) {
    const olData = await getOpenLibraryRating(isbn, title, author);

    if (olData && olData.average) {
        const countStr = olData.count ? ` · ${olData.count}` : '';
        modalOlRating.textContent = `OpenLib: ★ ${olData.average}${countStr}`;
        modalOlRating.classList.remove('hidden');

        // Auto-fill External Rating if empty
        if (editRating.value === '') {
            editRating.value = olData.average;
        }
    }
}

async function syncBookStatuses(books) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updates = [];

        books.forEach(book => {
            if (!book.target_date) return;

            // Parse date (YYYY-MM-DD)
            const [year, month, day] = book.target_date.split('-').map(Number);
            const bookDate = new Date(year, month - 1, day);

            let newStatus = null;

            // 1. Past Date Logic: Only auto-mark as 'Read' if it was 'Scheduled' or 'Priority'
            // We do NOT want to overwrite 'DNF', 'Skipped', 'Reading', etc.
            if (bookDate < today) {
                if (book.status === 'Scheduled' || book.status === 'Priority') {
                    newStatus = 'Read';
                }
            }
            // 2. Future Date Logic: Only auto-mark as 'Scheduled' if it was 'Read' or 'Finished' (Correction mode)
            // We do NOT want to overwrite 'Voting', 'Proposed', 'Priority' just because it has a date.
            else if (bookDate >= today) {
                if (book.status === 'Read' || book.status === 'Finished') {
                    newStatus = 'Scheduled';
                }
            }

            if (newStatus && newStatus !== book.status) {
                updates.push({
                    id: book.id,
                    status: newStatus
                });
                // Optimistically update local state so UI reflects it immediately
                book.status = newStatus;
            }
        });

        if (updates.length > 0) {
            console.log(`Syncing statuses for ${updates.length} books...`);

            // Batch updates to prevent flooding the server/browser
            // Process in chunks of 5 parallel requests
            const CHUNK_SIZE = 5;
            for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
                const chunk = updates.slice(i, i + CHUNK_SIZE);
                await Promise.all(chunk.map(update =>
                    supabase
                        .from('book_club_list')
                        .update({ status: update.status })
                        .eq('id', update.id)
                ));
            }
            console.log('Status sync complete.');
        }
    } catch (error) {
        console.error('Error syncing book statuses:', error);
        // Don't throw, just log. We don't want to break the app if sync fails.
    }
}

function generateGoogleCalendarLink(title, dateStr) {
    // Default to 7:00 PM - 9:00 PM on the target date
    const startDate = new Date(dateStr + 'T19:00:00');
    const endDate = new Date(dateStr + 'T21:00:00');

    const format = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Book Club: ${title}`,
        details: `Discussing ${title}. Find discussion questions here: https://www.google.com/search?q=${encodeURIComponent(title + ' book club discussion questions')}`,
        dates: `${format(startDate)}/${format(endDate)}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadIcsFile(title, dateStr) {
    const startDate = new Date(dateStr + 'T19:00:00');
    const endDate = new Date(dateStr + 'T21:00:00');
    const now = new Date();

    const format = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Book Club Companion//EN',
        'BEGIN:VEVENT',
        `UID:${now.getTime()}@bookclubcompanion.com`,
        `DTSTAMP:${format(now)}`,
        `DTSTART:${format(startDate)}`,
        `DTEND:${format(endDate)}`,
        `SUMMARY:Book Club: ${title}`,
        `DESCRIPTION:Discussing ${title}.`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `book-club-${dateStr}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function toggleCalendarDropdown(event, id = 'calendar-dropdown') {
    event.stopPropagation();
    // Close others
    document.querySelectorAll('[id^="calendar-dropdown"]').forEach(el => {
        if (el.id !== id) el.classList.add('hidden');
    });

    const dropdown = document.getElementById(id);
    if (dropdown) dropdown.classList.toggle('hidden');
}

// Close dropdowns when clicking outside
window.addEventListener('click', () => {
    document.querySelectorAll('[id^="calendar-dropdown"]').forEach(dropdown => {
        if (!dropdown.classList.contains('hidden')) {
            dropdown.classList.add('hidden');
        }
    });
});

// --- Discussion Guide Logic ---

let currentDiscussionBook = null;

const CURATED_QUESTIONS = {
    'Origins of The Wheel of Time': [
        "Michael Livingston argues that Robert Jordan’s experiences in Vietnam fundamentally shaped the moral landscape of The Wheel of Time. How do you see the \"fog of war\" and the trauma of combat reflected in the journeys of Rand, Mat, and Perrin?",
        "The book highlights the real-world mythology (Arthurian, Norse, Eastern) that Jordan wove into the pattern. Which mythological parallel surprised you the most, and did learning its origin change how you view that part of the story?",
        "Livingston had access to Jordan’s private notes and the \"Bonepile.\" Did this behind-the-scenes look demystify the magic of the series for you, or did it deepen your appreciation for Jordan's architectural genius?",
        "The relationship between Jordan (James Rigney) and his editor/wife Harriet McDougal is central to the book's creation. How does understanding their creative partnership alter your perception of the strong female characters in the series?",
        "Livingston touches on the \"Great Lord of the Dark\" being a force of chaos and selfishness rather than just \"evil.\" How does this nuance in the book's philosophy resonate with the real-world struggles Jordan faced?",
        "The book discusses the iconic (and sometimes controversial) cover art of the series. Did learning about the constraints and choices behind the covers change your opinion of them?",
        "Jordan was a student of history. How do real-world political maneuvers discussed in the book (like the Game of Houses) mirror historical events mentioned by Livingston?",
        "The One Power is often cited as a \"hard\" magic system. Did the book reveal any \"soft\" edges or initial concepts that were later rigidified?",
        "The book touches on the early internet fandom. How does the \"pre-internet\" experience of reading the books compare to the modern, hyper-connected analysis?",
        "Michael Livingston is both a fan and a scholar. Did you find his personal interjections and \"fan moments\" helpful to the narrative, or did they distract from the scholarly analysis?"
    ],
    'Project Hail Mary': [
        "Ryland Grace starts as a coward and ends as a hero. At what point do you think he truly changed? Was it a specific moment, or a gradual shift?",
        "Rocky is an alien, yet he feels incredibly human. How does their friendship compare to human friendships in the book? What does it say about the universal nature of connection?",
        "The book relies heavily on science and problem-solving. Did you find the \"competence porn\" satisfying, or did it ever feel like too much?",
        "Stratt is a polarizing character. Do you think her \"ends justify the means\" approach was necessary to save humanity? Would you have made the same choices?",
        "The ending is bittersweet. Were you satisfied with Grace's choice to stay on Erid? Why or why not?",
        "How does the theme of memory loss impact the narrative? Did uncovering Grace's past change your opinion of him?",
        "If you were in Grace's shoes, waking up alone on a spaceship, what would be your first reaction?",
        "The book explores the idea of \"life\" finding a way (the Astrophage). Did you find yourself sympathizing with the \"villain\" (the algae) at all?",
        "What does the book suggest about the role of teachers and education in society?",
        "Rocky's language is musical. How did you imagine his voice sounding? Did the communication barrier enhance or hinder their bond?",
        "The concept of \"panspermia\" suggests life shares a common origin. How does this theme resonate with the cooperation between species in the book?",
        "Was the sacrifice of the other crew members (Yao and Ilyukhina) given enough weight, or were they just plot devices?"
    ],
    'Lessons in Chemistry': [
        "Elizabeth Zott refuses to accept the limits placed on her by society. In what ways is she a \"modern\" woman, and in what ways is she a product of her time?",
        "The book explores the difference between \"chemistry\" (science) and \"chemistry\" (love/cooking). How does Elizabeth use cooking as a tool for empowerment?",
        "Six-Thirty is a beloved character. What role does he play in the story? Is he just a dog, or something more?",
        "The relationship between Elizabeth and Calvin is tragic but pivotal. How does his memory continue to shape her life and choices?",
        "Harriet Sloane is a crucial support system. What does the book say about female friendship and the \"village\" it takes to raise a family (and a career)?",
        "The book tackles serious issues (sexual assault, sexism) with a sometimes humorous tone. Did this balance work for you?",
        "\"Supper at Six\" becomes a phenomenon. Why do you think her message resonated so strongly with the housewives of America?",
        "Madeline is a precocious child. Do you think her character was realistic? How does she reflect her parents?",
        "What did you make of the ending? Was it too neat, or a well-deserved victory lap?",
        "The book suggests that \"cooking is chemistry.\" Do you agree? How has this book changed the way you view the domestic sphere?",
        "Elizabeth is often described as \"difficult.\" Is she difficult, or just uncompromising? How would a man with her personality be described?",
        "The theme of \"faith\" vs. \"science\" comes up. How does Elizabeth navigate the world of belief without compromising her scientific principles?"
    ],
    'The Seven Husbands of Evelyn Hugo': [
        "Evelyn is unapologetically ambitious. Did you admire her drive, or did you find her ruthless? Can a woman be both?",
        "Which of the seven husbands was your favorite? Which was the worst? Why?",
        "The central love story is not with a husband, but with Celia St. James. Were you surprised by this reveal? How did it reframe the rest of the book for you?",
        "Evelyn hides her true self to protect her career. In the age of social media, do you think celebrities still have to do this, or has the nature of fame changed?",
        "Monique is the vessel for Evelyn's story. Did you care about Monique's personal journey, or were you just waiting to get back to Evelyn?",
        "The \"green dress\" scene is iconic. What does it represent about Evelyn's use of her sexuality as a weapon/tool?",
        "Harry Cameron is Evelyn's platonic soulmate. Is their love any less valid than her romantic love for Celia?",
        "Evelyn makes some morally gray choices (e.g., the car accident). Did you forgive her? Does she deserve forgiveness?",
        "The title suggests the husbands define her, but the book proves otherwise. What actually defines Evelyn Hugo?",
        "\"They are just husbands. I am Evelyn Hugo.\" Discuss this quote. What does it say about identity and ownership of one's life?",
        "How does the book explore the intersection of race and Hollywood? (Evelyn changing her name/hair).",
        "If Evelyn were a real person today, who would she be? (e.g., Marilyn Monroe, Elizabeth Taylor)."
    ]
};

const GENERIC_FALLBACK_MSG = "<em>No pre-loaded guide available. Click 'Generate Guide AI' to create a custom one instantly.</em>";

function getDiscussionQuestions(book) {
    if (book.discussion_questions) {
        return book.discussion_questions;
    }
    // Check for curated questions (exact title match)
    const title = book.google_data.volumeInfo.title;
    if (CURATED_QUESTIONS[title]) {
        return CURATED_QUESTIONS[title].join('\n\n');
    }
    // No fallback - return empty to trigger "Generate" prompt
    return "";
}

async function generateDiscussionQuestionsAI() {
    if (!currentDiscussionBook) return;
    const btn = document.getElementById('btn-generate-ai');
    const viewEl = document.getElementById('discussion-content-view');
    const originalText = btn.innerHTML;

    try {
        btn.disabled = true;
        btn.innerHTML = '<iconify-icon icon="line-md:loading-loop" class="text-lg"></iconify-icon> Generating...';
        viewEl.innerHTML = '<div class="flex flex-col items-center justify-center p-8 text-stone-400 gap-3"><iconify-icon icon="line-md:loading-loop" class="text-4xl"></iconify-icon><p>Consulting literary archives...</p></div>';

        const book = currentDiscussionBook;
        const title = book.google_data.volumeInfo.title;
        const author = book.google_data.volumeInfo.authors?.join(', ') || 'Unknown';
        const description = book.google_data.volumeInfo.description || '';

        const prompt = `Act as an expert literary discussion leader. Synthesize the top 15 most thought-provoking discussion questions for the book "${title}" by ${author}.
Context: ${description.substring(0, 500)}...
Rules:
1. Questions must be specific to characters and plot points (no generic "did you like it?" filler).
2. Look for moral dilemmas, character motivations, and thematic elements.
3. Return ONLY the list of 15 questions, numbered 1-15.
4. Do not include intro or outro text.`;

        const response = await fetch(GEMINI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                maxTokens: 2000 // Ensure enough length for 15 questions
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server Error ${response.status}`);
        }

        const data = await response.json();
        let questions = data.text.trim();

        // Append Model Attribution (so users know quality level)
        if (data.modelUsed) {
            questions += `\n\n_Generated by ${data.modelUsed}_`;
        }

        // Cleanup response
        questions = questions.replace(/[\*\"]/g, ''); // Remove bolding/quotes

        // Save & Render
        currentDiscussionBook.discussion_questions = questions;

        // Update DB
        if (currentDiscussionBook.id) {
            await supabase.from('book_club_list').update({ discussion_questions: questions }).eq('id', currentDiscussionBook.id);
        }

        // Refresh UI
        openDiscussionModal(currentDiscussionBook);
        showSimpleAlert('Guide Generated!');

    } catch (e) {
        console.error(e);
        viewEl.innerHTML = `<p class="text-rose-600">Error: ${e.message}. Please try again.</p>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function openDiscussionModal(book) {
    currentDiscussionBook = book;
    const modal = document.getElementById('discussion-modal');
    const titleEl = document.getElementById('discussion-modal-title');
    const viewEl = document.getElementById('discussion-content-view');
    const editEl = document.getElementById('discussion-content-edit');
    const generateBtn = document.getElementById('btn-generate-ai');
    const editBtn = document.getElementById('btn-edit-questions');

    titleEl.textContent = book.google_data.volumeInfo.title;

    const questions = getDiscussionQuestions(book);

    if (questions) {
        // Show Questions
        viewEl.innerHTML = questions.split('\n').filter(q => q.trim()).map((q, index) => {
            // Check for attribution line
            if (q.startsWith('_Generated by') || q.startsWith('Generated by')) {
                return `<p class="mt-8 text-sm text-stone-400 italic text-right border-t pt-2">${q.replace(/_/g, '')}</p>`;
            }

            const isNumbered = /^\d+\./.test(q);
            const text = isNumbered ? q : `${index + 1}. ${q}`;
            return `<p class="mb-4 font-serif text-lg text-stone-800 leading-relaxed pl-4 -indent-4">${text}</p>`;
        }).join('');
        generateBtn.classList.add('hidden');
        editBtn.classList.remove('hidden');
    } else {
        // Show Fallback
        viewEl.innerHTML = `<div class="p-8 text-center text-stone-500">${GENERIC_FALLBACK_MSG}</div>`;
        generateBtn.classList.remove('hidden');
        editBtn.classList.add('hidden'); // Hide edit until we have content
    }

    // Populate Edit
    editEl.value = questions;

    // Reset State
    viewEl.classList.remove('hidden');
    editEl.classList.add('hidden');
    if (editBtn) editBtn.textContent = 'Edit Questions';
    document.getElementById('btn-save-questions').classList.add('hidden');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDiscussionModal() {
    const modal = document.getElementById('discussion-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentDiscussionBook = null;
}

function toggleEditQuestions() {
    const viewEl = document.getElementById('discussion-content-view');
    const editEl = document.getElementById('discussion-content-edit');
    const editBtn = document.getElementById('btn-edit-questions');
    const saveBtn = document.getElementById('btn-save-questions');

    if (editEl.classList.contains('hidden')) {
        // Switch to Edit Mode
        viewEl.classList.add('hidden');
        editEl.classList.remove('hidden');
        editBtn.textContent = 'Cancel';
        saveBtn.classList.remove('hidden');
        editEl.focus();
    } else {
        // Switch to View Mode (Cancel)
        editEl.classList.add('hidden');
        viewEl.classList.remove('hidden');
        editBtn.textContent = 'Edit Questions';
        saveBtn.classList.add('hidden');
        // Reset value
        editEl.value = getDiscussionQuestions(currentDiscussionBook);
    }
}

async function saveDiscussionQuestions() {
    if (!currentDiscussionBook) return;

    const editEl = document.getElementById('discussion-content-edit');
    const saveBtn = document.getElementById('btn-save-questions');
    const newQuestions = editEl.value;

    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
        const { error } = await supabase
            .from('book_club_list')
            .update({ discussion_questions: newQuestions })
            .eq('id', currentDiscussionBook.id);

        if (error) throw error;

        // Update local state
        currentDiscussionBook.discussion_questions = newQuestions;

        // Refresh View with Numbering
        const viewEl = document.getElementById('discussion-content-view');
        viewEl.innerHTML = newQuestions.split('\n').filter(q => q.trim()).map((q, index) => {
            const isNumbered = /^\d+\./.test(q);
            const text = isNumbered ? q : `${index + 1}. ${q}`;
            return `<p class="mb-4 font-serif text-lg text-stone-800 leading-relaxed pl-4 -indent-4">${text}</p>`;
        }).join('');

        // Switch back to View Mode
        toggleEditQuestions();
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;

    } catch (err) {
        console.error('Error saving questions:', err);
        saveBtn.textContent = 'Error';
        setTimeout(() => {
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
        }, 2000);
    }
}

function printDiscussionGuide() {
    if (!currentDiscussionBook) return;

    const title = currentDiscussionBook.google_data.volumeInfo.title;
    const questions = getDiscussionQuestions(currentDiscussionBook);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Discussion Guide: ${title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
            <style>
                @page { 
                    margin: 0; 
                    size: auto;
                }
                body { 
                    font-family: 'Inter', sans-serif; 
                    color: #1c1917; 
                    background: white;
                    /* Simulate margins here to hide browser headers/footers */
                    padding: 40px 60px; 
                    max-width: 800px; 
                    margin: 0 auto; 
                }
                .header { 
                    border-bottom: 2px solid #f5f5f4; 
                    padding-bottom: 24px; 
                    margin-bottom: 40px; 
                    margin-top: 20px;
                }
                .brand { 
                    font-family: 'Inter', sans-serif; 
                    font-size: 11px; 
                    font-weight: 600; 
                    text-transform: uppercase; 
                    letter-spacing: 2px; 
                    color: #be123c; /* Rose-700 */
                    margin-bottom: 12px; 
                }
                h1 { 
                    font-family: 'Playfair Display', serif; 
                    font-size: 36px; 
                    font-weight: 700; 
                    margin: 0; 
                    color: #1c1917; 
                    line-height: 1.2;
                }
                .question-container { 
                    margin-bottom: 24px; 
                    break-inside: avoid; 
                    display: flex; 
                    gap: 12px;
                }
                .question-num { 
                    font-family: 'Playfair Display', serif; 
                    font-weight: 700; 
                    color: #e11d48; /* Rose-600 */
                    font-size: 18px; 
                    min-width: 24px;
                }
                .question-text { 
                    font-size: 16px; 
                    line-height: 1.6; 
                    color: #44403c; 
                }
                .footer { 
                    position: fixed; 
                    bottom: 20px; 
                    left: 0; 
                    right: 0; 
                    text-align: center; 
                    font-size: 10px; 
                    color: #a8a29e; 
                    background: white;
                }
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="brand">Book Club Companion</div>
                <h1>${title}</h1>
            </div>
            
            <div class="content">
                ${questions.split('\n').filter(q => q.trim()).map((q, index) => {
        // Strip existing numbering if present to use our styled numbering
        const cleanText = q.replace(/^\d+\.\s*/, '');
        return `
                        <div class="question-container">
                            <div class="question-num">${index + 1}.</div>
                            <div class="question-text">${cleanText}</div>
                        </div>
                    `;
    }).join('')}
            </div>

            <div class="footer">
                Generated by Book Club Companion
            </div>

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// --- Visual Import (Gemini AI) ---

// Init immediately (script is at bottom of body)
(function initVisualImport() {
    const toggleApiKeyBtn = document.getElementById('toggle-api-key');
    const apiKeyContainer = document.getElementById('api-key-container');
    const geminiApiKeyInput = document.getElementById('gemini-api-key');
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    // Check for Config Key (Environment Variable Simulation)
    let configKey = null;
    if (typeof CONFIG !== 'undefined' && CONFIG.GOOGLE_GEMINI_API_KEY) {
        configKey = CONFIG.GOOGLE_GEMINI_API_KEY;
    }

    // 0. Init State based on Config
    if (configKey) {
        // If key is configured in code, hide the setup UI to keep it clean for the user
        if (toggleApiKeyBtn) toggleApiKeyBtn.classList.add('hidden');
        if (apiKeyContainer) apiKeyContainer.classList.add('hidden');
    } else {
        // 1. Toggle Key Input (Only if manual setup needed)
        if (toggleApiKeyBtn) {
            toggleApiKeyBtn.addEventListener('click', () => {
                apiKeyContainer.classList.toggle('hidden');
                // Load saved key
                const savedKey = localStorage.getItem('gemini_api_key');
                if (savedKey) geminiApiKeyInput.value = savedKey;
            });
        }

        // 2. Save Key on Input
        if (geminiApiKeyInput) {
            geminiApiKeyInput.addEventListener('input', (e) => {
                localStorage.setItem('gemini_api_key', e.target.value.trim());
            });
        }
    }

    // 3. Handle Image Upload
    if (imageUploadInput) {
        const handleFile = async (file) => {
            if (!file) return;

            // Support for simple text file upload (.txt)
            if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const text = e.target.result;
                    const queries = text.split('\n')
                        .map(l => l.trim())
                        .filter(l => l.length > 0);

                    if (queries.length > 0) {
                        if (imagePreviewContainer) {
                            imagePreviewContainer.innerHTML = `
                                <div class="relative rounded-lg overflow-hidden border border-blue-200 bg-blue-50 p-3 text-center">
                                    <iconify-icon icon="solar:document-text-bold" class="text-blue-600 text-xl mb-1"></iconify-icon>
                                    <p class="text-xs text-blue-800 font-bold">Processing ${queries.length} titles from text file...</p>
                                </div>
                            `;
                            imagePreviewContainer.classList.remove('hidden');
                        }
                        const importProgress = document.getElementById('import-progress');
                        if (importProgress) importProgress.classList.remove('hidden');

                        await searchAndQueueBooks(queries);
                    } else {
                        alert('File seems empty.');
                    }
                };
                reader.readAsText(file);
                return;
            }

            // Validation: Use Config Key OR Local Storage
            const apiKey = configKey || localStorage.getItem('gemini_api_key');

            if (!apiKey) {
                alert('Please setup your Google Gemini API Key first.');
                if (apiKeyContainer) {
                    apiKeyContainer.classList.remove('hidden');
                    if (geminiApiKeyInput) geminiApiKeyInput.focus();
                }
                return;
            }

            // Show Preview & Loop Logic
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Data = e.target.result;
                if (imagePreviewContainer) {
                    imagePreviewContainer.innerHTML = `
                        <div class="relative rounded-lg overflow-hidden border border-stone-200">
                            <img src="${base64Data}" class="w-full h-48 object-cover opacity-50">
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="bg-white/90 px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                                    <iconify-icon icon="svg-spinners:ring-resize" class="text-amber-600 text-xl"></iconify-icon>
                                    <span class="text-xs font-bold text-amber-800">Analyzing Books...</span>
                                </div>
                            </div>
                        </div>
                    `;
                    imagePreviewContainer.classList.remove('hidden');
                }

                try {
                    const results = await callGeminiVision(base64Data, apiKey);

                    if (results && results.length > 0) {
                        const queries = results.map(b => `${b.title} - ${b.author}`);
                        const importProgress = document.getElementById('import-progress');
                        if (importProgress) importProgress.classList.remove('hidden');
                        await searchAndQueueBooks(queries);
                        if (imagePreviewContainer) {
                            imagePreviewContainer.innerHTML = `
                                <div class="relative rounded-lg overflow-hidden border border-green-200 bg-green-50 p-3 text-center">
                                    <iconify-icon icon="solar:check-circle-bold" class="text-green-600 text-xl mb-1"></iconify-icon>
                                    <p class="text-xs text-green-800 font-bold">Found ${results.length} books!</p>
                                </div>
                            `;
                        }
                    } else {
                        alert('No books detected. Try a clearer photo.');
                        if (imagePreviewContainer) imagePreviewContainer.innerHTML = '';
                    }
                } catch (err) {
                    console.error(err);
                    if (imagePreviewContainer) {
                        imagePreviewContainer.innerHTML = `
                            <div class="bg-red-50 text-red-600 text-xs p-3 rounded">
                                Error: ${err.message}. Check your API Key.
                            </div>
                        `;
                    }
                }
            };
            reader.readAsDataURL(file);
        };

        // Standard Input Change
        imageUploadInput.addEventListener('change', (e) => {
            handleFile(e.target.files[0]);
        });

        // Robust Drag & Drop on Container
        const dropZone = document.getElementById('drop-zone');

        if (dropZone) {
            // Drag Events
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            dropZone.addEventListener('dragover', () => {
                dropZone.classList.add('bg-rose-50', 'border-rose-300');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('bg-rose-50', 'border-rose-300');
            });

            dropZone.addEventListener('drop', (e) => {
                dropZone.classList.remove('bg-rose-50', 'border-rose-300');
                const dt = e.dataTransfer;
                const file = dt.files[0];
                handleFile(file);
            });
        }
    }

    async function callGeminiVision(base64Data, apiKey) {
        const base64Image = base64Data.split(',')[1]; // Remove header

        const prompt = `
            Analyze this image. Identify all books visible (covers or spines) or read the text if it's a list.
            Return strictly a JSON array of objects with "title" and "author" keys.
            Example: [{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald"}]
            If no books found, return [].
        `;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                ]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error details:', errorBody);
            throw new Error(`API Error (${response.status}): ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) return [];

        // Clean Markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    }
})();

// --- AI Comparison Modal Logic ---

const comparisonModal = document.getElementById('comparison-modal');
const closeComparisonBtn = document.getElementById('close-comparison-btn');
const comparisonCancelBtn = document.getElementById('comparison-cancel-btn');
const comparisonAcceptBtn = document.getElementById('comparison-accept-btn'); // Legacy, kept for safety but unused
const comparisonAppendBtn = document.getElementById('comparison-append-btn');
const comparisonReplaceBtn = document.getElementById('comparison-replace-btn');
const comparisonRetryBtn = document.getElementById('comparison-retry-btn');
const comparisonLoading = document.getElementById('comparison-loading');
const comparisonContent = document.getElementById('comparison-content');
const comparisonCurrentTags = document.getElementById('comparison-current-tags');
const comparisonAiTags = document.getElementById('comparison-ai-tags');

let currentComparisonBook = null;
let currentAiTagsResult = null;

function closeComparisonModal() {
    comparisonModal.classList.add('hidden');
    currentComparisonBook = null;
    currentAiTagsResult = null;
}

if (closeComparisonBtn) closeComparisonBtn.addEventListener('click', closeComparisonModal);
if (comparisonCancelBtn) comparisonCancelBtn.addEventListener('click', closeComparisonModal);

async function openComparisonModal(book) {
    currentComparisonBook = book;
    comparisonModal.classList.remove('hidden');

    // Reset State
    const setButtons = (enabled) => {
        [comparisonAppendBtn, comparisonReplaceBtn].forEach(btn => {
            if (!btn) return;
            btn.disabled = !enabled;
            if (enabled) {
                btn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });
        if (comparisonRetryBtn) comparisonRetryBtn.disabled = true;
    };

    setButtons(false);
    comparisonLoading.classList.remove('hidden');
    comparisonContent.classList.add('hidden'); // Hide grid until loaded
    comparisonAiTags.innerHTML = '';

    // Populate Current Data
    comparisonCurrentTags.innerHTML = '';
    if (book.tags && book.tags.length > 0) {
        book.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = `inline-flex items-center text-xs px-2 py-1 rounded font-medium ${window.getTagColor ? window.getTagColor(tag) : 'bg-stone-100 text-stone-800'}`;
            span.textContent = tag;
            comparisonCurrentTags.appendChild(span);
        });
    } else {
        comparisonCurrentTags.innerHTML = '<span class="text-stone-400 italic text-xs">No tags set</span>';
    }

    // Call AI
    try {
        // Use clean description or fallback
        const description = book.google_data?.volumeInfo?.description || "No description available.";
        const result = await generateTagsAI(book.title, book.author, description);

        // Render AI Tags
        comparisonAiTags.innerHTML = '';

        if (result && result.success && result.tags && result.tags.length > 0) {
            currentAiTagsResult = result.tags; // Store for accept

            // Show Tags
            result.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = `inline-flex items-center text-xs px-2 py-1 rounded font-medium ${window.getTagColor ? window.getTagColor(tag) : 'bg-indigo-100 text-indigo-700'} border border-indigo-200`;
                span.textContent = tag;
                comparisonAiTags.appendChild(span);
            });

            // Show Filtered Warning
            if (result.filtered && result.filtered.length > 0) {
                const warning = document.createElement('div');
                warning.className = "w-full text-[10px] text-amber-600 mt-2 p-1 border border-amber-200 bg-amber-50 rounded";
                warning.innerHTML = `⚠️ Ignored ${result.filtered.length} invalid tags: ${result.filtered.join(', ')}`;
                comparisonAiTags.appendChild(warning);
            }

            // Enable Buttons
            setButtons(true);
            if (comparisonRetryBtn) comparisonRetryBtn.disabled = false;

        } else if (result && result.success) {
            // Success but empty tags
            let filteredHtml = '';
            if (result.filtered && result.filtered.length > 0) {
                filteredHtml = `<div class="w-full text-[10px] text-amber-600 mt-2 p-1 border border-amber-200 bg-amber-50 rounded">
                    ⚠️ Ignored ${result.filtered.length} invalid tags: ${result.filtered.join(', ')}
                </div>`;
            }

            comparisonAiTags.innerHTML = `
                <div class="flex flex-col gap-1">
                    <span class="text-stone-500 italic text-xs">AI returned text but no valid tags found.</span>
                    ${filteredHtml}
                    <details class="text-[9px] text-stone-400 cursor-pointer mt-2">
                        <summary>Raw Output</summary>
                        <pre class="whitespace-pre-wrap mt-1 p-1 bg-stone-100 rounded">${result.raw || 'Empty'}</pre>
                    </details>
                </div>`;
        } else {
            // Error
            const errorMsg = result?.error || 'Unknown failure';
            comparisonAiTags.innerHTML = `
                <div class="flex flex-col gap-1">
                    <span class="text-rose-500 italic text-xs font-bold">Generation Failed</span>
                     <div class="text-[10px] text-rose-700 border border-rose-200 bg-rose-50 p-2 rounded">
                        Error: ${errorMsg}
                    </div>
                </div>`;
        }

    } catch (error) {
        console.error("Comparison Error:", error);
        comparisonAiTags.innerHTML = '<span class="text-rose-500 italic text-xs">Error connecting to AI.</span>';
        if (comparisonRetryBtn) comparisonRetryBtn.disabled = false;
    } finally {
        comparisonLoading.classList.add('hidden');
        comparisonContent.classList.remove('hidden');
        // Always enable Retry after attempt finishes
        if (comparisonRetryBtn) comparisonRetryBtn.disabled = false;
    }
}

async function saveTags(mode) {
    if (!currentComparisonBook || !currentAiTagsResult) return;

    // Choose Button based on mode
    const btn = mode === 'append' ? comparisonAppendBtn : comparisonReplaceBtn;
    const originalText = btn.innerHTML;

    // Lock UI
    [comparisonAppendBtn, comparisonReplaceBtn, comparisonRetryBtn].forEach(b => {
        if (b) b.disabled = true;
    });
    btn.innerHTML = '<iconify-icon icon="solar:spinner-bold" class="animate-spin"></iconify-icon> Saving...';

    try {
        let finalTags = [];
        if (mode === 'append') {
            const existingTags = currentComparisonBook.tags || [];
            finalTags = [...new Set([...existingTags, ...currentAiTagsResult])];
        } else {
            finalTags = currentAiTagsResult;
        }

        // Update Supabase
        if (error) throw error;

        // Update local state for parent modal
        currentModalTags = finalTags;
        renderModalTags();

        // Update cache
        const cacheIndex = allSavedBooks.findIndex(b => b.id === currentComparisonBook.id);
        if (cacheIndex !== -1) {
            allSavedBooks[cacheIndex].tags = finalTags;
        }

        // Success
        closeComparisonModal();
        fetchSavedBooks(); // Refresh the grid to show new tags
        showSimpleAlert(mode === 'append' ? `Merged! Now has ${finalTags.length} tags.` : `Replaced! Now has ${finalTags.length} tags.`);

    } catch (error) {
        console.error('Error saving tags:', error);
        showError('Failed to save AI tags. Please try again.');

        // Reset UI
        if (comparisonAppendBtn) comparisonAppendBtn.disabled = false;
        if (comparisonReplaceBtn) comparisonReplaceBtn.disabled = false;
        if (comparisonRetryBtn) comparisonRetryBtn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Wire up Buttons
if (comparisonAppendBtn) comparisonAppendBtn.addEventListener('click', () => saveTags('append'));
if (comparisonReplaceBtn) comparisonReplaceBtn.addEventListener('click', () => saveTags('replace'));
if (comparisonRetryBtn) comparisonRetryBtn.addEventListener('click', () => openComparisonModal(currentComparisonBook));

window.openComparisonModal = openComparisonModal;
