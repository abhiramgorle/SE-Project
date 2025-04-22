// cypress/e2e/videoDetails.cy.js

describe('Video Details Component', () => {
    beforeEach(() => {
      // Mock user login data
      window.sessionStorage.setItem('authData', JSON.stringify({
        id: 201,
        nickname: 'loggedUser',
        avatar: 'https://example.com/loggeduser.jpg'
      }));
  
      // Mock the API response for video details
      cy.intercept('GET', 'videos/1', {
        statusCode: 200,
        body: {
          data: {
            id: 1,
            file_url: 'https://example.com/video1.mp4',
            thumb_url: 'https://example.com/thumbnail1.jpg',
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
              is_followed: false,
              website_url: 'https://testuser.com',
              facebook_url: 'https://facebook.com/testuser',
              instagram_url: 'https://instagram.com/testuser',
              youtube_url: 'https://youtube.com/testuser',
              twitter_url: 'https://twitter.com/testuser'
            }
          }
        }
      }).as('getVideoDetails');
  
      // Visit the video details page
      cy.visit('/all/1');
    });
  
    it('should render video details correctly', () => {
      cy.wait('@getVideoDetails');
      
      // Check if video element exists
      cy.get('video').should('exist');
      
      // Check if user info is displayed
      cy.contains('testuser').should('be.visible');
      cy.contains('Test video description').should('be.visible');
      
      // Check if the follow button is visible
      cy.contains('Follow').should('be.visible');
    });
  
    it('should play and pause the video when clicked', () => {
      cy.wait('@getVideoDetails');
      
      // Get the video element
      const video = cy.get('video');
      
      // Spy on the play method
      cy.window().then((win) => {
        cy.spy(HTMLMediaElement.prototype, 'play').as('play');
        cy.spy(HTMLMediaElement.prototype, 'pause').as('pause');
      });
      
      // Click the video to pause (default is playing)
      video.click();
      cy.get('@pause').should('be.called');
      
      // Click again to play
      video.click();
      cy.get('@play').should('be.called');
    });
  
    it('should adjust volume when volume controls are used', () => {
      cy.wait('@getVideoDetails');
      
      // Click the volume icon to mute
      cy.get('.fa-volume-up, .fa-volume-down').click();
      
      // Check if the mute icon is visible
      cy.get('.fa-volume-mute').should('be.visible');
      
      // Click again to unmute
      cy.get('.fa-volume-mute').click();
      
      // Check if the volume icon is visible
      cy.get('.fa-volume-up').should('be.visible');
      
      // Adjust volume with the slider
      cy.get('input[type="range"]').eq(1).invoke('val', 0.3).trigger('change');
      
      // Check if volume-down icon is visible for lower volume
      cy.get('.fa-volume-down').should('be.visible');
    });
  
    it('should seek in the video when using the timeline slider', () => {
      cy.wait('@getVideoDetails');
      
      // Spy on the currentTime property
      cy.window().then((win) => {
        cy.spy(HTMLMediaElement.prototype, 'currentTime', ['set']).as('seek');
      });
      
      // Set the timeline slider to 50% of video duration
      cy.get('input[type="range"]').first().invoke('val', 30).trigger('change');
      
      // Check if the currentTime was set
      cy.get('@seek').should('be.called');
    });
  
    it('should load comments when comment icon is clicked', () => {
      cy.wait('@getVideoDetails');
      
      // Mock the API response for comments
      cy.intercept('GET', 'videos/1/comments', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 501,
              comment: 'This is a test comment',
              created_at: '2025-04-20T10:00:00Z',
              is_liked: false,
              likes_count: 5,
              user: {
                id: 201,
                nickname: 'loggedUser',
                avatar: 'https://example.com/loggeduser.jpg',
                tick: false
              }
            },
            {
              id: 502,
              comment: 'Another test comment',
              created_at: '2025-04-19T15:30:00Z',
              is_liked: true,
              likes_count: 10,
              user: {
                id: 102,
                nickname: 'anotheruser',
                avatar: 'https://example.com/anotheruser.jpg',
                tick: true
              }
            }
          ]
        }
      }).as('getComments');
      
      // Click the comment icon
      cy.get('.fa-comment').first().click();
      
      // Wait for the API call to complete
      cy.wait('@getComments');
      
      // Check if comments are loaded
      cy.contains('This is a test comment').should('be.visible');
      cy.contains('Another test comment').should('be.visible');
    });
  
    it('should like or unlike a video when the heart icon is clicked', () => {
      cy.wait('@getVideoDetails');
      
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
      
      // Mock the API response for unliking a video
      cy.intercept('POST', 'videos/1/unlike', {
        statusCode: 200,
        body: {
          data: {
            id: 1,
            is_liked: false,
            likes_count: 100
          }
        }
      }).as('unlikeVideo');
      
      // Click the heart icon again
      cy.get('.fa-heart.text-red-500').first().click();
      
      // Wait for the API call to complete
      cy.wait('@unlikeVideo');
      
      // Check if the heart icon is no longer red
      cy.get('.fa-heart').first().should('not.have.class', 'text-red-500');
    });
  
    it('should follow or unfollow a user when the follow button is clicked', () => {
      cy.wait('@getVideoDetails');
      
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
      
      // Click the follow button
      cy.contains('Follow').click();
      
      // Wait for the API call to complete
      cy.wait('@followUser');
      
      // Check if the button text changed to "Following"
      cy.contains('Following').should('be.visible');
      
      // Mock the API response for unfollowing a user
      cy.intercept('POST', 'users/101/unfollow', {
        statusCode: 200,
        body: {
          data: {
            id: 101,
            nickname: 'testuser',
            avatar: 'https://example.com/avatar.jpg',
            tick: true,
            is_followed: false
          }
        }
      }).as('unfollowUser');
      
      // Click the following button
      cy.contains('Following').click();
      
      // Wait for the API call to complete
      cy.wait('@unfollowUser');
      
      // Check if the button text changed back to "Follow"
      cy.contains('Follow').should('be.visible');
    });
  
    it('should post a new comment', () => {
      cy.wait('@getVideoDetails');
      
      // Mock the API response for posting a comment
      cy.intercept('POST', 'videos/1/comments', {
        statusCode: 200,
        body: {
          data: {
            id: 503,
            comment: 'This is my new comment',
            created_at: '2025-04-21T12:34:56Z',
            is_liked: false,
            likes_count: 0,
            user: {
              id: 201,
              nickname: 'loggedUser',
              avatar: 'https://example.com/loggeduser.jpg',
              tick: false
            }
          }
        }
      }).as('postComment');
      
      // Type a comment
      cy.get('input[type="text"]').type('This is my new comment');
      
      // Submit the form
      cy.contains('Post').click();
      
      // Wait for the API call to complete
      cy.wait('@postComment');
      
      // Check if the new comment is displayed
      cy.contains('This is my new comment').should('be.visible');
    });
  
    it('should delete a comment', () => {
      cy.wait('@getVideoDetails');
      
      // Load comments
      cy.intercept('GET', 'videos/1/comments', {
        statusCode: 200,
        body: {
          data: [
            {
              id: 501,
              comment: 'This is a test comment',
              created_at: '2025-04-20T10:00:00Z',
              is_liked: false,
              likes_count: 5,
              user: {
                id: 201,
                nickname: 'loggedUser',
                avatar: 'https://example.com/loggeduser.jpg',
                tick: false
              }
            }
          ]
        }
      }).as('getComments');
      
      cy.get('.fa-comment').first().click();
      cy.wait('@getComments');
      
      // Mock the API response for deleting a comment
      cy.intercept('DELETE', 'comments/501', {
        statusCode: 200
      }).as('deleteComment');
      
      // Click the ellipsis icon
      cy.get('.fa-ellipsis').click();
      
      // Click the delete option
      cy.contains('Delete').click();
      
      // Wait for the API call to complete
      cy.wait('@deleteComment');
      
      // Check if the comment is no longer displayed
      cy.contains('This is a test comment').should('not.exist');
    });
  });