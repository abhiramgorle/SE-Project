// cypress/e2e/following.cy.js

describe('Following Component', () => {
    beforeEach(() => {
      // Mock the API response for suggested users
      cy.intercept('GET', 'users/suggested?page=1&per_page=8', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 1,
              nickname: 'user1',
              first_name: 'First',
              last_name: 'User',
              avatar: 'https://example.com/avatar1.jpg',
              tick: true,
              popular_video: {
                file_url: 'https://example.com/video1.mp4'
              }
            },
            {
              id: 2,
              nickname: 'user2',
              first_name: 'Second',
              last_name: 'User',
              avatar: 'https://example.com/avatar2.jpg',
              tick: false,
              popular_video: {
                file_url: 'https://example.com/video2.mp4'
              }
            },
            {
              id: 3,
              nickname: 'user3',
              first_name: 'Third',
              last_name: 'User',
              avatar: 'https://example.com/avatar3.jpg',
              tick: true,
              popular_video: {
                file_url: 'https://example.com/video3.mp4'
              }
            }
          ],
          meta: {
            pagination: {
              total_pages: 3,
              current_page: 1
            }
          }
        }
      }).as('getSuggestedUsers');
      
      // Visit the following page
      cy.visit('/following');
    });
  
    it('should render suggested users when not logged in', () => {
      cy.wait('@getSuggestedUsers');
      
      // Check if the suggested users are displayed
      cy.get('video').should('have.length', 3);
      cy.contains('user1').should('be.visible');
      cy.contains('user2').should('be.visible');
      cy.contains('user3').should('be.visible');
      
      // Check if the "Following" buttons are displayed
      cy.contains('button', 'Following').should('have.length', 3);
    });
  
    it('should display verified badge for verified users', () => {
      cy.wait('@getSuggestedUsers');
      
      // Find users with verified badges
      cy.get('.fa-circle-check').should('have.length', 2);
      
      // Check if the verified badges are displayed for the correct users
      cy.contains('user1').parent().find('.fa-circle-check').should('exist');
      cy.contains('user3').parent().find('.fa-circle-check').should('exist');
      cy.contains('user2').parent().find('.fa-circle-check').should('not.exist');
    });
  
    it('should load more users when scrolling to the bottom', () => {
      cy.wait('@getSuggestedUsers');
      
      // Mock the API response for the second page of suggested users
      cy.intercept('GET', 'users/suggested?page=2&per_page=8', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 4,
              nickname: 'user4',
              first_name: 'Fourth',
              last_name: 'User',
              avatar: 'https://example.com/avatar4.jpg',
              tick: false,
              popular_video: {
                file_url: 'https://example.com/video4.mp4'
              }
            },
            {
              id: 5,
              nickname: 'user5',
              first_name: 'Fifth',
              last_name: 'User',
              avatar: 'https://example.com/avatar5.jpg',
              tick: true,
              popular_video: {
                file_url: 'https://example.com/video5.mp4'
              }
            }
          ],
          meta: {
            pagination: {
              total_pages: 3,
              current_page: 2
            }
          }
        }
      }).as('getMoreSuggestedUsers');
      
      // Scroll to the bottom of the container
      cy.get('.overflow-y-scroll').scrollTo('bottom');
      
      // Wait for the API call to complete
      cy.wait('@getMoreSuggestedUsers');
      
      // Check if additional users are loaded
      cy.get('video').should('have.length', 5);
      cy.contains('user4').should('be.visible');
      cy.contains('user5').should('be.visible');
    });
  
    it('should open login modal when "Following" button is clicked', () => {
      cy.wait('@getSuggestedUsers');
      
      // Click the "Following" button for the first user
      cy.contains('button', 'Following').first().click();
      
      // Check if the login modal is displayed
      cy.contains('Log In').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });
  
    it('should render the Video component when logged in', () => {
      // Mock sessionStorage to simulate logged-in state
      cy.window().then((win) => {
        const authData = {
          id: 101,
          name: 'Test User',
          nickname: 'testuser',
          avatar: 'https://example.com/testuser.jpg'
        };
        win.sessionStorage.setItem('authData', JSON.stringify(authData));
      });
      
      // Mock the API response for the "following" type videos
      cy.intercept('GET', 'videos?type=following&page=1', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 1,
              file_url: 'https://example.com/following-video1.mp4',
              description: 'Following video description',
              music: 'Test music',
              published_at: '2025-04-01T12:00:00Z',
              is_liked: false,
              likes_count: 100,
              comments_count: 50,
              shares_count: 25,
              user: {
                id: 101,
                nickname: 'followeduser',
                avatar: 'https://example.com/followeduser.jpg',
                tick: true,
                is_followed: true
              }
            }
          ],
          meta: {
            pagination: {
              total_pages: 1,
              current_page: 1
            }
          }
        }
      }).as('getFollowingVideos');
      
      // Reload the page to apply the sessionStorage changes
      cy.reload();
      
      // Check if the Video component is rendered with "following" type
      cy.get('.overflow-y-scroll').should('exist');
      cy.wait('@getFollowingVideos');
      
      // Check if the video is displayed
      cy.get('video').should('exist');
      cy.contains('Following video description').should('be.visible');
      cy.contains('followeduser').should('be.visible');
    });
  
    it('should redirect to login when logged out and a button is clicked', () => {
      cy.wait('@getSuggestedUsers');
      
      // Spy on Redux action dispatches
      cy.window().then((win) => {
        win.store = {
          dispatch: cy.stub().as('dispatch')
        };
      });
      
      // Click the "Following" button for the first user
      cy.contains('button', 'Following').first().click();
      
      // Check if the login modal is displayed
      cy.contains('Log In').should('be.visible');
      
      // Fill in the login form
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      
      // Click the login button
      cy.contains('button', 'Log In').click();
      
      // Check if the login action was dispatched
      cy.get('@dispatch').should('be.calledOnce');
    });
  
    it('should handle user login through Redux', () => {
      cy.wait('@getSuggestedUsers');
      
      // Mock Redux state update for successful login
      cy.window().then((win) => {
        // Simulate Redux state update
        win.dispatchEvent(new CustomEvent('redux-state-change', {
          detail: {
            auth: {
              user: {
                data: {
                  id: 101,
                  name: 'Test User',
                  nickname: 'testuser',
                  avatar: 'https://example.com/testuser.jpg'
                }
              }
            }
          }
        }));
      });
      
      // Mock the API response for the "following" type videos
      cy.intercept('GET', 'videos?type=following&page=1', {
        statusCode: 200,
        body: {
          data: [],
          meta: {
            pagination: {
              total_pages: 0,
              current_page: 1
            }
          }
        }
      }).as('getFollowingVideos');
      
      // Check if the component state is updated to show the "following" videos
      cy.wait('@getFollowingVideos');
      
      // The grid of suggested users should not be visible
      cy.get('.grid-cols-3').should('not.exist');
      
      // The Video component should be visible
      cy.get('.overflow-y-scroll').should('exist');
    });
  });