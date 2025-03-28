import { fetchSheetData } from './sheets.js';

export class DivisionsManager {
    constructor() {
        this.divisionsContainer = document.getElementById('divisions-container');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    async loadDivisions() {
        try {
            this.showLoading();
            this.hideError();

            // Check cache first
            const cachedData = this.cache.get('divisions');
            if (cachedData && (Date.now() - cachedData.timestamp < this.cacheTimeout)) {
                console.log('Using cached divisions data');
                await this.renderDivisions(cachedData.data);
                return;
            }

            console.log('Fetching fresh divisions data');
            const divisions = await fetchSheetData('Divisions');
            
            // Cache the new data
            this.cache.set('divisions', {
                data: divisions,
                timestamp: Date.now()
            });

            await this.renderDivisions(divisions);

        } catch (error) {
            console.error('Error loading divisions:', error);
            this.showError(error);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    showError(error) {
        if (this.errorElement) {
            this.errorElement.innerHTML = `
                <h3>Error Loading Divisions</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="retry-button">
                    Try Again
                </button>
            `;
            this.errorElement.style.display = 'block';
        }
    }

    hideError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
    }

    async renderDivisions(divisions) {
        if (!this.divisionsContainer || !divisions) return;

        if (divisions.length === 0) {
            this.showError(new Error('No divisions found in the sheet.'));
            return;
        }

        const divisionCards = divisions.map(division => this.createDivisionCard(division)).join('');

        this.divisionsContainer.innerHTML = `
            <div class="divisions-grid">
                ${divisionCards}
            </div>
        `;

        // Add hover effect listeners
        document.querySelectorAll('.division-card').forEach(card => {
            card.addEventListener('mouseenter', this.handleCardHover);
            card.addEventListener('mouseleave', this.handleCardHover);
        });
    }

    createDivisionCard(division) {
        const achievements = division.achievements
            ? division.achievements.split(',').map(achievement => 
                `<li>${achievement.trim()}</li>`
              ).join('')
            : '';

        return `
            <div class="division-card">
                <div class="division-header">
                    ${division.icon ? `
                        <img src="images/icons/${division.icon}.png" 
                             alt="${division.name} icon" 
                             class="division-icon"
                             onerror="this.src='images/icons/default.png'">
                    ` : ''}
                    <h3>${division.name || 'Unnamed Division'}</h3>
                </div>
                <div class="division-info">
                    <p class="division-leader">
                        <strong>Leader:</strong> ${division.leader || 'No Leader Assigned'}
                    </p>
                    <p class="division-count">
                        <strong>Members:</strong> ${division.member_count || '0'}
                    </p>
                    <p class="division-description">
                        ${division.description || 'No description available'}
                    </p>
                    ${achievements ? `
                        <div class="division-achievements">
                            <h4>Achievements</h4>
                            <ul>${achievements}</ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    handleCardHover(event) {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (event.type === 'mouseenter') {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 0 30px rgba(0, 225, 255, 0.2)';
        } else {
            card.style.transform = 'none';
            card.style.boxShadow = 'none';
        }
    }
}

// Initialize divisions when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const divisionsManager = new DivisionsManager();
    divisionsManager.loadDivisions();
}); 