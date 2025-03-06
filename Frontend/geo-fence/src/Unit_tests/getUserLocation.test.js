import getUserLocation from '../utils/getUserLocation';

// Mock the navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};

global.navigator.geolocation = mockGeolocation;

describe('getUserLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves with latitude and longitude on success', async () => {
    // Mock successful geolocation
    const mockPosition = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    const result = await getUserLocation();
    
    expect(result).toEqual({
      lat: 37.7749,
      lng: -122.4194,
    });
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(mockGeolocation.getCurrentPosition.mock.calls[0][2]).toEqual({
      timeout: 5000,
      maximumAge: 0,
      enableHighAccuracy: true,
    });
  });

  it('rejects with error when geolocation fails', async () => {
    // Mock geolocation error
    const mockError = new Error('Geolocation error');
    
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    await expect(getUserLocation()).rejects.toEqual(mockError);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
  });
});