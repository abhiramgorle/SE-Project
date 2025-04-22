// cypress/e2e/video.cy.js

describe('Video Component', () => {
    beforeEach(() => {
      // Mock the API response
      cy.intercept('GET', 'videos*', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 1,
              file_url: 'https://example.com/video1.mp4',
              description: 'Test video description',
              music: 'Test music',
              published_at: '2025-04-01T12:00:00Z',
              is_liked: false,
              likes_count: 100,
              comments_count: 50,
              shares_count: 25,
              user: {
                id: 101,
                nickname: 'testuser',
                avatar: 'https://example.com/avatar.jpg',
                tick: true,
                is_followed: false
              }
            }
          ],
          meta: {
            pagination: {
              total_pages: 5,
              current_page: 1
            }
          }
        }
      }).as('getVideos');
  
      // Visit the page that contains the Video component
      cy.visit('/');
    });
  
    it('should render videos from the API', () => {
      cy.wait('@getVideos');
      cy.get('[data-id="1"]').should('exist');
      cy.contains('Test video description').should('be.visible');
      cy.contains('testuser').should('be.visible');
    });
  
    it('should play and pause a video when clicked', () => {
      cy.wait('@getVideos');
      
      // Find the video element
      const video = cy.get('[data-id="1"]');
      
      // Click to play
      video.click();
      
      // Check if the pause icon is visible (indicating the video is playing)
      cy.get('.fa-pause').should('be.visible');
      
      // Click again to pause
      video.click();
      
      // Check if the play icon is visible (indicating the video is paused)
      cy.get('.fa-play').should('be.visible');
    });
  
    it('should adjust volume when volume slider is changed', () => {
      cy.wait('@getVideos');
      
      // Mouse over the video to show volume controls
      cy.get('[data-id="1"]').trigger('mouseenter');
      
      // Find the volume slider and set it to 0.2
      cy.get('input[type="range"]').first().invoke('val', 0.2).trigger('change');
      
      // Check if the volume icon changed
      cy.get('.fa-volume-low').should('be.visible');
    });
  
    it('should like a video when the heart icon is clicked', () => {
      cy.wait('@getVideos');
      
      // Mock the API response for liking a video
      cy.intercept('POST', 'videos/1/like', {
        statusCode: 200,
        body: {
          data: {
            id: 1,
            is_liked: true,
            likes_count: 101
          }
        }
      }).as('likeVideo');
      
      // Click the heart icon
      cy.get('.fa-heart').first().click();
      
      // Wait for the API call to complete
      cy.wait('@likeVideo');
      
      // Check if the heart icon is now red
      cy.get('.fa-heart.text-red-500').should('exist');
      
      // Check if the like count is updated
      cy.contains('101').should('be.visible');
    });
  
    it('should navigate to video detail page when comment icon is clicked', () => {
      cy.wait('@getVideos');
      
      // Mock the router navigation
      cy.intercept('GET', '/all/1', {}).as('navigateToDetail');
      
      // Click the comment icon
      cy.get('.fa-comment').first().click();
      
      // Check if navigation occurred
      cy.url().should('include', '/all/1');
    });
  
    it('should load more videos when scrolling to the bottom', () => {
      cy.wait('@getVideos');
      
      // Mock the API response for the second page
      cy.intercept('GET', 'videos?type=*&page=2', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 2,
              file_url: 'https://example.com/video2.mp4',
              description: 'Second video description',
              music: 'Second music',
              published_at: '2025-04-02T12:00:00Z',
              is_liked: false,
              likes_count: 200,
              comments_count: 100,
              shares_count: 50,
              user: {
                id: 102,
                nickname: 'seconduser',
                avatar: 'https://example.com/avatar2.jpg',
                tick: false,
                is_followed: false
              }
            }
          ],
          meta: {
            pagination: {
              total_pages: 5,
              current_page: 2
            }
          }
        }
      }).as('getMoreVideos');
      
      // Scroll to the bottom of the container
      cy.get('.overflow-y-scroll').scrollTo('bottom');
      
      // Wait for the API call to complete
      cy.wait('@getMoreVideos');
      
      // Check if the second video is rendered
      cy.get('[data-id="2"]').should('exist');
      cy.contains('Second video description').should('be.visible');
    });
  
    it('should follow a user when the plus icon is clicked', () => {
      cy.wait('@getVideos');
      
      // Mock the API response for following a user
      cy.intercept('POST', 'users/101/follow', {
        statusCode: 200,
        body: {
          data: {
            id: 101,
            nickname: 'testuser',
            avatar: 'https://example.com/avatar.jpg',
            tick: true,
            is_followed: true
          }
        }
      }).as('followUser');
      
      // Click the plus icon
      cy.get('.fa-plus').first().click();
      
      // Wait for the API call to complete
      cy.wait('@followUser');
      
      // Check if the plus icon changed to a check icon
      cy.get('.fa-check').should('exist');
    });
  });