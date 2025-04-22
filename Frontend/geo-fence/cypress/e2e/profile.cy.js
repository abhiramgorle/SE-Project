// cypress/e2e/profile.cy.js

describe('Profile Component', () => {
    beforeEach(() => {
      // Mock the API response for user profile
      cy.intercept('GET', 'users/@testuser', {
        statusCode: 200,
        body: {
          data: {
            id: 101,
            nickname: 'testuser',
            avatar: 'https://example.com/avatar.jpg',
            bio: 'Test user bio',
            following_count: 500,
            followers_count: 1000,
            likes_count: 5000,
            videos: [
              {
                id: 1,
                file_url: 'https://example.com/video1.mp4',
                description: 'Test video description',
                views_count: 1000
              },
              {
                id: 2,
                file_url: 'https://example.com/video2.mp4',
                description: 'Second video description',
                views_count: 2000
              }
            ]
          }
        }
      }).as('getUserProfile');
  
      // Visit the profile page
      cy.visit('/profile/testuser');
    });
  
    it('should render the profile header with user information', () => {
      cy.wait('@getUserProfile');
      
      // Check if user info is displayed in the header
      cy.contains('testuser').should('be.visible');
      cy.contains('Test user bio').should('be.visible');
      cy.contains('500').should('be.visible'); // Following count
      cy.contains('1000').should('be.visible'); // Followers count
      cy.contains('5000').should('be.visible'); // Likes count
    });
  
    it('should display videos tab by default', () => {
      cy.wait('@getUserProfile');
      
      // Check if the Videos tab is active
      cy.contains('Videos').parent().should('have.class', 'border-black');
      
      // Check if videos are displayed
      cy.get('video').should('have.length', 2);
    });
  
    it('should switch to Reposts tab when clicked', () => {
      cy.wait('@getUserProfile');
      
      // Mock the response for reposts (empty in this case)
      cy.intercept('GET', '**/reposts*', {
        statusCode: 200,
        body: {
          data: []
        }
      }).as('getReposts');
      
      // Click the Reposts tab
      cy.contains('Reposts').click();
      
      // Check if the Reposts tab is active
      cy.contains('Reposts').parent().should('have.class', 'border-black');
      
      // Check if the Videos tab is not active
      cy.contains('Videos').parent().should('not.have.class', 'border-black');
    });
  
    it('should switch to Favorites tab when clicked', () => {
      cy.wait('@getUserProfile');
      
      // Mock the response for favorites (empty in this case)
      cy.intercept('GET', '**/favorites*', {
        statusCode: 200,
        body: {
          data: []
        }
      }).as('getFavorites');
      
      // Click the Favorites tab
      cy.contains('Favorites').click();
      
      // Check if the Favorites tab is active
      cy.contains('Favorites').parent().should('have.class', 'border-black');
    });
  
    it('should switch to Liked tab when clicked', () => {
      cy.wait('@getUserProfile');
      
      // Mock the response for liked videos (empty in this case)
      cy.intercept('GET', '**/liked*', {
        statusCode: 200,
        body: {
          data: []
        }
      }).as('getLiked');
      
      // Click the Liked tab
      cy.contains('Liked').click();
      
      // Check if the Liked tab is active
      cy.contains('Liked').parent().should('have.class', 'border-black');
    });
  
    it('should navigate to video details when a video is clicked', () => {
      cy.wait('@getUserProfile');
      
      // Mock the navigation
      cy.intercept('GET', '/all/1', {}).as('navigateToVideo');
      
      // Click the first video
      cy.get('video').first().click();
      
      // Check if navigation occurred
      cy.url().should('include', '/all/1');
    });
  });