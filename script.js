// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Event Calendar
class EventCalendar {
    constructor() {
        this.events = [];
        this.loadEvents();
    }

    async loadEvents() {
        this.events = await sheetsManager.getEvents() || [];
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    async renderEvents(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        await this.loadEvents();

        const eventsList = document.createElement('div');
        eventsList.className = 'events-list';

        this.events.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `event-item ${event.type}`;
            eventElement.innerHTML = `
                <h4>${event.title}</h4>
                <p>${this.formatDate(event.date)} at ${event.time}</p>
            `;
            eventsList.appendChild(eventElement);
        });

        container.innerHTML = '';
        container.appendChild(eventsList);
    }
}

// Member Search
class MemberSearch {
    constructor() {
        this.members = [];
        this.loadMembers();
    }

    async loadMembers() {
        this.members = await sheetsManager.getMembers() || [];
    }

    async search(query) {
        await this.loadMembers();
        return this.members.filter(member => 
            member.name.toLowerCase().includes(query.toLowerCase()) ||
            member.class.toLowerCase().includes(query.toLowerCase())
        );
    }

    renderResults(results, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        results.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = 'member-search-result';
            memberElement.innerHTML = `
                <h4>${member.name}</h4>
                <p>Class: ${member.class}</p>
                <p>Level: ${member.level}</p>
                <p>Role: ${member.role}</p>
            `;
            container.appendChild(memberElement);
        });
    }
}

// Stats Manager
class StatsManager {
    constructor() {
        this.stats = [];
        this.loadStats();
    }

    async loadStats() {
        this.stats = await sheetsManager.getStats() || [];
    }

    async renderStats() {
        await this.loadStats();
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        statsGrid.innerHTML = '';
        this.stats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card animate-on-scroll';
            statCard.innerHTML = `
                <h3>${stat.title}</h3>
                <p class="stat-number">${stat.value}</p>
            `;
            statsGrid.appendChild(statCard);
        });
    }
}

// News Manager
class NewsManager {
    constructor() {
        this.news = [];
        this.loadNews();
    }

    async loadNews() {
        this.news = await sheetsManager.getNews() || [];
    }

    async renderNews() {
        await this.loadNews();
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;

        newsGrid.innerHTML = '';
        this.news.forEach(item => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card animate-on-scroll';
            newsCard.innerHTML = `
                <h3>${item.title}</h3>
                <p class="news-date">${item.date}</p>
                <img src="${item.image}" alt="${item.title}">
                <p>${item.content}</p>
            `;
            newsGrid.appendChild(newsCard);
        });
    }
}

// Initialize features when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Event Calendar
    const calendar = new EventCalendar();
    await calendar.renderEvents('upcoming-events');

    // Initialize Member Search
    const memberSearch = new MemberSearch();
    const searchInput = document.getElementById('member-search');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const results = await memberSearch.search(e.target.value);
            memberSearch.renderResults(results, 'search-results');
        });
    }

    // Initialize Stats
    const statsManager = new StatsManager();
    await statsManager.renderStats();

    // Initialize News
    const newsManager = new NewsManager();
    await newsManager.renderNews();

    // Form validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your interest! We will contact you soon.');
        });
    }
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add scroll animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .news-card, .stat-card').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
}); 