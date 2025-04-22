// cypress/e2e/app-flow.cy.js

describe('Application Flow Testing', () => {
    beforeEach(() => {
      // Login user before each test
      cy.login();
      
      // Mock the videos for the feed
      cy.mockVideosAPI('for-you', 1, [
        {
          id: 1,
          file_url: 'https://example.com/video1.mp4',
          description: 'First test video',
          music: 'First test music',
          published_at: '2025-04-01T12:00:00Z',
          is_liked: false,
          likes_count: 100,
          comments_count: 50,
          shares_count: 25,
          user: {
            id: 101,
            nickname: 'creator1',
            avatar: 'https://example.com/creator1.jpg',
            tick: true,
            is_followed: false
          }
        },
        {
          id: 2,
          file_url: 'https://example.com/video2.mp4',
          description: 'Second test video',
          music: 'Second test music',
          published_at: '2025-04-02T12:00:00Z',
          is_liked: true,
          likes_count: 200,
          comments_count: 75,
          shares_count: 30,
          user: {
            id: 102,
            nickname: 'creator2',
            avatar: 'https://example.com/creator2.jpg',
            tick: false,
            is_followed: true
          }
        }
      ]);
      
      // Visit the home page
      cy.visit('/');
    });
  
    it('should navigate from feed to video details page', () => {
      // Mock video details API
      cy.mockVideoDetailsAPI(1);
      
      // Mock comments API
      cy.mockCommentsAPI(1);
      
      // Click on comment icon to navigate to details
      cy.get('.fa-comment').first().click();
      
      // Verify we're on the details page
      cy.url().should('include', '/all/1');
      
      // Wait for video details to load
      cy.wait('@getVideoDetails');
      
      // Check if video player is visible
      cy.get('video').should('be.visible');
      
      // Check if user details are visible
      cy.contains('testuser').should('be.visible');
      
      // Verify the description is visible
      cy.contains('Test video description').should('be.visible');
    });
  
    it('should navigate from feed to user profile page', () => {
      // Mock API response for user profile
      cy.intercept('GET', 'users/@creator1', {
        statusCode: 200,
        body: {
          data: {
            id: 101,
            nickname: 'creator1',
            avatar: 'https://example.com/creator1.jpg',
            bio: 'Creator 1 bio',
            following_count: 500,
            followers_count: 1000,
            likes_count: 5000,
            videos: [
              {
                id: 1,
                file_url: 'https://example.com/video1.mp4',
                description: 'First test video',
                views_count: 1000
              }
            ]
          }
        }
      }).as('getUserProfile');
      
      // Click on the user avatar
      cy.get('img.rounded-full').first().click();
      
      // Check if we've navigated to the profile page
      cy.url().should('include', '/profile/creator1');
      
      // Wait for the profile to load
      cy.wait('@getUserProfile');
      
      // Verify profile info is visible
      cy.contains('creator1').should('be.visible');
      cy.contains('Creator 1 bio').should('be.visible');
      
      // Check if the videos tab is active by default
      cy.contains('Videos').parent().should('have.class', 'border-black');
    });
  
    it('should like a video and then unlike it', () => {
      // Mock like API
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
      
      // Mock unlike API
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
      
      // Click heart icon to like
      cy.get('.fa-heart').first().click();
      cy.wait('@likeVideo');
      
      // Verify heart is now red
      cy.get('.fa-heart.text-red-500').should('exist');
      
      // Click heart icon again to unlike
      cy.get('.fa-heart.text-red-500').first().click();
      cy.wait('@unlikeVideo');
      
      // Verify heart is no longer red
      cy.get('.fa-heart').first().should('not.have.class', 'text-red-500');
    });
  
    it('should follow and unfollow a user', () => {
      // Mock follow API
      cy.intercept('POST', 'users/101/follow', {
        statusCode: 200,
        body: {
          data: {
            id: 101,
            nickname: 'creator1',
            avatar: 'https://example.com/creator1.jpg',
            tick: true,
            is_followed: true
          }
        }
      }).as('followUser');
      
      // Mock unfollow API
      cy.intercept('POST', 'users/101/unfollow', {
        statusCode: 200,
        body: {
          data: {
            id: 101,
            nickname: 'creator1',
            avatar: 'https://example.com/creator1.jpg',
            tick: true,
            is_followed: false
          }
        }
      }).as('unfollowUser');
      
      // Click plus icon to follow
      cy.get('.fa-plus').first().click();
      cy.wait('@followUser');
      
      // Verify plus changed to check
      cy.get('.fa-check').should('exist');
      
      // Click check icon to unfollow
      cy.get('.fa-check').first().click();
      cy.wait('@unfollowUser');
      
      // Verify check changed back to plus
      cy.get('.fa-plus').should('exist');
    });
  
    it('should adjust video volume', () => {
      // Trigger mouse enter to show volume controls
      cy.get('[data-id="1"]').trigger('mouseenter');
      
      // Set volume to 0
      cy.get('input[type="range"]').first().invoke('val', 0).trigger('change');
      
      // Check if mute icon is visible
      cy.get('.fa-volume-mute').should('be.visible');
      
      // Set volume to 0.3
      cy.get('input[type="range"]').first().invoke('val', 0.3).trigger('change');
      
      // Check if low volume icon is visible
      cy.get('.fa-volume-low').should('be.visible');
      
      // Set volume to 0.8
      cy.get('input[type="range"]').first().invoke('val', 0.8).trigger('change');
      
      // Check if high volume icon is visible
      cy.get('.fa-volume-high').should('be.visible');
    });
  
    it('should play and pause video', () => {
      // Use the custom command to test video interaction
      cy.testVideoInteraction('[data-id="1"]');
      
      // Verify the correct icon is displayed
      cy.get('.fa-play').should('be.visible');
      
      // Click again to play
      cy.get('[data-id="1"]').click();
      
      // Verify the pause icon is displayed
      cy.get('.fa-pause').should('be.visible');
    });
  
    it('should test infinite scroll', () => {
      // Mock the second page of videos
      cy.mockVideosAPI('for-you', 2, [
        {
          id: 3,
          file_url: 'https://example.com/video3.mp4',
          description: 'Third test video',
          music: 'Third test music',
          published_at: '2025-04-03T12:00:00Z',
          is_liked: false,
          likes_count: 300,
          comments_count: 100,
          shares_count: 40,
          user: {
            id: 103,
            nickname: 'creator3',
            avatar: 'https://example.com/creator3.jpg',
            tick: true,
            is_followed: false
          }
        }
      ]);
      
      // Scroll to the bottom of the container
      cy.get('.overflow-y-scroll').scrollTo('bottom');
      
      // Wait for the second page to load
      cy.wait('@getVideos');
      
      // Verify the third video is rendered
      cy.contains('Third test video').should('be.visible');
      cy.contains('creator3').should('be.visible');
    });
  
    it('should add and delete a comment', () => {
      // Mock video details API
      cy.mockVideoDetailsAPI(1);
      
      // Mock comments API
      cy.mockCommentsAPI(1);
      
      // Click on comment icon to navigate to details
      cy.get('.fa-comment').first().click();
      
      // Wait for comments to load
      cy.wait('@getComments');
      
      // Mock post comment API
      cy.intercept('POST', 'videos/1/comments', {
        statusCode: 200,
        body: {
          data: {
            id: 503,
            comment: 'This is a new test comment',
            created_at: '2025-04-21T12:34:56Z',
            is_liked: false,
            likes_count: 0,
            user: {
              id: 201,
              nickname: 'testuser',
              avatar: 'https://example.com/avatar.jpg',
              tick: false
            }
          }
        }
      }).as('postComment');
      
      // Type a comment
      cy.get('input[type="text"]').type('This is a new test comment');
      
      // Submit the comment
      cy.get('button[type="submit"]').click();
      
      // Wait for the post comment API to complete
      cy.wait('@postComment');
      
      // Verify the new comment is displayed
      cy.contains('This is a new test comment').should('be.visible');
      
      // Mock delete comment API
      cy.intercept('DELETE', 'comments/503', {
        statusCode: 200
      }).as('deleteComment');
      
      // Click the ellipsis icon
      cy.get('.fa-ellipsis').click();
      
      // Click the delete option
      cy.contains('Delete').click();
      
      // Wait for the delete comment API to complete
      cy.wait('@deleteComment');
      
      // Verify the comment is no longer displayed
      cy.contains('This is a new test comment').should('not.exist');
    });
  });