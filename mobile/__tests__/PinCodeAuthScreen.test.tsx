import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PinCodeAuthScreen } from '../src/screens/auth/PinCodeAuthScreen';
import AuthenticationService from '../src/logic/AuthenticationService';

jest.mock('react-native-wheel-color-picker', () => {
  return () => null;
});

jest.mock('../src/logic/AuthenticationService', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(),
    getCredentials: jest.fn(),
    putCredentials: jest.fn(),
  },
}));

// Mock Theme values
jest.mock('../src/theme/theme', () => {
  const actual = jest.requireActual('../src/theme/theme');

  return {
    ...actual,
    TextStyles: {
      ...actual.TextStyles,
    },
  };
});

jest.mock('../src/theme/colourController', () => {
  const mockReact = require('react');
  return {
    ThemeContext: mockReact.createContext({ theme: {}, accessibility: {} }),
  };
});

jest.mock('../src/theme/paperTheme', () => ({
  paperTheme: () => ({}),
}));

jest.mock('react-native-paper', () => {
  const { Text, View } = require('react-native');
  const mockReact = require('react');
  return {
    Avatar: {
      Icon: (props: any) => mockReact.createElement(View, props),
    },
    Button: (props: any) => mockReact.createElement(Text, { onPress: props.onPress }, props.children),
    Dialog: Object.assign(
      (props: any) => props.visible
        ? mockReact.createElement(View, { onDismiss: props.onDismiss }, props.children)
        : null,
      {
        Title: ({ children }: any) => mockReact.createElement(Text, null, children),
        Content: ({ children }: any) => mockReact.createElement(View, null, children),
        Actions: ({ children }: any) => mockReact.createElement(View, null, children),
      }
    ),
    Portal: ({ children }: any) => children,
  };
});

const mockIsAuth = jest.fn();

const mockFetch = AuthenticationService.fetch as jest.Mock;
const mockGetCredentials = AuthenticationService.getCredentials as jest.Mock;
const mockPutCredentials = AuthenticationService.putCredentials as jest.Mock;

const profileResponse = (hasPinCode: boolean, firstName = 'Thomas') => ({
  ok: true,
  json: jest.fn().mockResolvedValue({ hasPinCode, firstName }),
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockResolvedValue(profileResponse(true));
});

describe('PinCodeAuthScreen', () => {
  it('renders welcome back message when user has a pin code', async () => {
    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => {
      expect(getByText('Welcome back, Thomas!')).toBeTruthy();
    });
  });

  it('renders create pin code message when user does not have a pin code', async () => {
    mockFetch.mockResolvedValueOnce(profileResponse(false));
    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => {
      expect(getByText('Create your pin code!')).toBeTruthy();
    });
  });

  it('renders all keypad buttons', async () => {
    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6','7','8','9','0','x','>'].forEach(btn => {
      expect(getByText(btn)).toBeTruthy();
    });
  });

  it('renders 6 pin bubbles all disabled initially', async () => {
    const { getByText, getAllByTestId } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    expect(getAllByTestId('bubble-disabled')).toHaveLength(6);
  });

  it('enables bubbles as digits are pressed', async () => {
    const { getByText, getAllByTestId } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    fireEvent.press(getByText('1'));
    fireEvent.press(getByText('2'));
    fireEvent.press(getByText('3'));

    await waitFor(() => {
      expect(getAllByTestId('bubble-enabled')).toHaveLength(3);
      expect(getAllByTestId('bubble-disabled')).toHaveLength(3);
    });
  });

  it('removes a digit when x is pressed', async () => {
    const { getByText, getAllByTestId } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    fireEvent.press(getByText('1'));
    fireEvent.press(getByText('2'));
    fireEvent.press(getByText('x'));

    await waitFor(() => {
      expect(getAllByTestId('bubble-enabled')).toHaveLength(1);
      expect(getAllByTestId('bubble-disabled')).toHaveLength(5);
    });
  });

  it('shows error dialog when > is pressed with less than 6 digits', async () => {
    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    fireEvent.press(getByText('1'));
    fireEvent.press(getByText('>'));

    await waitFor(() => {
      expect(getByText('Please enter a 6-digit pin code')).toBeTruthy();
    });
  });

  it('authenticates successfully when 6 digits are entered', async () => {
    mockGetCredentials.mockResolvedValue({ refreshToken: 'test-refresh-token' });
    mockPutCredentials.mockResolvedValue(undefined);
    mockFetch
      .mockResolvedValueOnce(profileResponse(true))
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ accessToken: 'test-access-token' }),
        headers: { get: jest.fn().mockReturnValue('refreshToken=new-refresh-token; Path=/') },
      });

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)));

    await waitFor(() => {
      expect(mockIsAuth).toHaveBeenCalledWith(false);
      expect(mockPutCredentials).toHaveBeenCalledWith('test-access-token', 'new-refresh-token');
    });
  });

  it('shows error when credentials are null on 6 digit entry', async () => {
    mockGetCredentials.mockResolvedValue(null);

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)));

    await waitFor(() => {
      expect(getByText('Your session has expired. Please restart the app and log in again.')).toBeTruthy();
    });
  });

  it('shows invalid pin error on 401 response', async () => {
    const { HttpException } = require('../src/exception/HttpException');
    mockGetCredentials.mockResolvedValue({ refreshToken: 'token' });
    mockFetch
      .mockResolvedValueOnce(profileResponse(true))
      .mockRejectedValueOnce(new HttpException(401, 'Unauthorized'));

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)));

    await waitFor(() => {
      expect(getByText('Invalid pin code entered')).toBeTruthy();
    });
  });

  it('shows unknown error on unexpected exception', async () => {
    mockGetCredentials.mockResolvedValue({ refreshToken: 'token' });
    mockFetch
      .mockResolvedValueOnce(profileResponse(true))
      .mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)));

    await waitFor(() => {
      expect(getByText('An unknown error occurred during authentication. Please try again later.')).toBeTruthy();
    });
  });

  it('dismisses error dialog when OK is pressed', async () => {
    const { getByText, queryByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    fireEvent.press(getByText('>'));
    await waitFor(() => expect(getByText('Please enter a 6-digit pin code')).toBeTruthy());

    fireEvent.press(getByText('OK'));

    await waitFor(() => {
      expect(queryByText('Please enter a 6-digit pin code')).toBeNull();
    });
  });

  it('shows session expired error on 401 during profile load', async () => {
    const { HttpException } = require('../src/exception/HttpException');
    mockFetch.mockRejectedValueOnce(new HttpException(401, 'Unauthorized'));

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => {
      expect(getByText('Your session has expired. Please restart the app and log in again.')).toBeTruthy();
    });
  });

  it('shows unknown error on unexpected exception during profile load', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => {
      expect(getByText('An unknown error occurred. Please try again later.')).toBeTruthy();
    });
  });

  it('shows unknown error when cookies are null after successful auth', async () => {
    mockGetCredentials.mockResolvedValue({ refreshToken: 'test-refresh-token' });
    mockFetch
      .mockResolvedValueOnce(profileResponse(true))
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ accessToken: 'test-access-token' }),
        headers: { get: jest.fn().mockReturnValue(null) },
      });

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)));

    await waitFor(() => {
      expect(getByText('An unknown error occurred during authentication. Please try again later.')).toBeTruthy();
    });
  });

  it('shows unknown error when refresh token cannot be parsed from cookies', async () => {
    mockGetCredentials.mockResolvedValue({ refreshToken: 'test-refresh-token' });
    mockFetch
      .mockResolvedValueOnce(profileResponse(true))
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ accessToken: 'test-access-token' }),
        headers: { get: jest.fn().mockReturnValue('someOtherCookie=value; Path=/') },
      });

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)));

    await waitFor(() => {
      expect(getByText('An unknown error occurred during authentication. Please try again later.')).toBeTruthy();
    });
  });

  it('dismisses error dialog when onDismiss is triggered', async () => {
    const { getByText, queryByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    fireEvent.press(getByText('>'));
    await waitFor(() => expect(getByText('Please enter a 6-digit pin code')).toBeTruthy());

    fireEvent(getByText('Error'), 'onDismiss');

    await waitFor(() => {
      expect(queryByText('Please enter a 6-digit pin code')).toBeNull();
    });
  });

  it('does not show error when > is pressed with exactly 6 digits', async () => {
    mockGetCredentials.mockResolvedValue({ refreshToken: 'token' });
    mockFetch
      .mockResolvedValueOnce(profileResponse(true))
      .mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({}),
        headers: { get: jest.fn().mockReturnValue(null) },
      });

    const { getByText, queryByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)));
    fireEvent.press(getByText('>'));

    await waitFor(() => {
      expect(queryByText('Please enter a 6-digit pin code')).toBeNull();
    });
  });

  it('does nothing when auth response is not ok', async () => {
    mockGetCredentials.mockResolvedValue({ refreshToken: 'token' });
    mockFetch
      .mockResolvedValueOnce(profileResponse(true))
      .mockResolvedValueOnce({ ok: false });

    const { getByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);
    await waitFor(() => expect(getByText('Welcome back, Thomas!')).toBeTruthy());

    ['1','2','3','4','5','6'].forEach(d => fireEvent.press(getByText(d)));

    await waitFor(() => {
      expect(mockIsAuth).not.toHaveBeenCalled();
    });
  });

  it('does nothing when profile response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    const { queryByText } = render(<PinCodeAuthScreen isAuth={mockIsAuth} />);

    await waitFor(() => {
      expect(queryByText('Welcome back')).toBeNull();
      expect(queryByText('Create your pin code!')).toBeNull();
    });
  });
});