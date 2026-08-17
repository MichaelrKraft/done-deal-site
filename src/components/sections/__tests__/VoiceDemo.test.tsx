import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceDemo from '../VoiceDemo';

vi.mock('@vercel/analytics', () => ({
  track: vi.fn(),
}));

// jsdom does not implement HTMLMediaElement playback or the Audio
// constructor, and VoiceDemo creates `new Audio(src)` + calls `.play()`
// whenever the orb is clicked or a sample clip is played. Stub both so the
// component can run in the test environment without crashing, and keep a
// handle on every instance created so tests can manually fire onended.
let audioInstances: MockAudio[] = [];

class MockAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  // play() must return a promise: VoiceDemo calls `.catch()` on the result
  // to swallow autoplay-policy/decode rejections.
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  constructor(public src?: string) {
    audioInstances.push(this);
  }
}

function finishPlayback() {
  const current = audioInstances[audioInstances.length - 1];
  current?.onended?.();
}

describe('VoiceDemo', () => {
  beforeEach(() => {
    audioInstances = [];
    vi.stubGlobal('Audio', MockAudio);
    // Spreading `URL` loses its constructor/prototype (next/image calls
    // `new URL(...)` internally), so stub only the one method the component
    // needs instead of replacing the global entirely.
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders without crashing', () => {
    render(<VoiceDemo />);
    expect(screen.getByText('Meet Reme.')).toBeInTheDocument();
  });

  it('shows the orb button with the "Hear Reme" label before playback', () => {
    render(<VoiceDemo />);
    expect(screen.getByRole('button', { name: /hear reme/i })).toBeInTheDocument();
  });

  it('does not show the live-question input until the intro finishes', () => {
    render(<VoiceDemo />);
    expect(
      screen.queryByPlaceholderText(/hear it in reme's voice/i)
    ).not.toBeInTheDocument();
  });

  it('plays the intro clip when the orb is clicked and switches to the "stop" state', () => {
    render(<VoiceDemo />);

    fireEvent.click(screen.getByRole('button', { name: /hear reme/i }));

    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('/remi/remi-intro.wav');
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /stop reme/i })).toBeInTheDocument();
  });

  it('reveals sample questions and the live-question input once the intro finishes', async () => {
    render(<VoiceDemo />);

    fireEvent.click(screen.getByRole('button', { name: /hear reme/i }));
    finishPlayback();

    expect(await screen.findByText('What deadlines do you track?')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/hear it in reme's voice/i)
    ).toBeInTheDocument();
  });

  it('stops playback and returns to idle when the orb is clicked while speaking', () => {
    render(<VoiceDemo />);

    fireEvent.click(screen.getByRole('button', { name: /hear reme/i }));
    expect(audioInstances[0].pause).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /stop reme/i }));

    expect(audioInstances[0].pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /hear reme/i })).toBeInTheDocument();
  });

  it('submits a live question, calls the TTS API, and plays the returned audio on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['fake-audio'], { type: 'audio/wav' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<VoiceDemo />);

    fireEvent.click(screen.getByRole('button', { name: /hear reme/i }));
    finishPlayback();

    const input = await screen.findByPlaceholderText(/hear it in reme's voice/i);
    fireEvent.change(input, { target: { value: 'What about title work?' } });
    fireEvent.click(screen.getByRole('button', { name: /hear it in reme's voice/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/voice-demo',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ text: 'What about title work?' }),
        })
      );
    });

    // A second Audio instance is created from the blob response and played.
    await waitFor(() => {
      expect(audioInstances).toHaveLength(2);
    });
    expect(audioInstances[1].src).toBe('blob:mock-url');
    expect(audioInstances[1].play).toHaveBeenCalledTimes(1);
  });

  it('shows an error toast and does not crash when the TTS API call fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', fetchMock);

    render(<VoiceDemo />);

    fireEvent.click(screen.getByRole('button', { name: /hear reme/i }));
    finishPlayback();

    const input = await screen.findByPlaceholderText(/hear it in reme's voice/i);
    fireEvent.change(input, { target: { value: 'What about HOA docs?' } });
    fireEvent.click(screen.getByRole('button', { name: /hear it in reme's voice/i }));

    expect(
      await screen.findByText(/reme could not read that back just now\. try again in a moment\./i)
    ).toBeInTheDocument();

    // Only the intro Audio should have been created — no audio played from a failed call.
    expect(audioInstances).toHaveLength(1);
  });

  it('shows an error toast when the fetch call itself rejects (network failure)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    render(<VoiceDemo />);

    fireEvent.click(screen.getByRole('button', { name: /hear reme/i }));
    finishPlayback();

    const input = await screen.findByPlaceholderText(/hear it in reme's voice/i);
    fireEvent.change(input, { target: { value: 'What about deadlines?' } });
    fireEvent.click(screen.getByRole('button', { name: /hear it in reme's voice/i }));

    expect(
      await screen.findByText(/reme could not read that back just now\. try again in a moment\./i)
    ).toBeInTheDocument();
  });

  it('disables the ask-live button while a question is empty', async () => {
    render(<VoiceDemo />);

    fireEvent.click(screen.getByRole('button', { name: /hear reme/i }));
    finishPlayback();

    const askButton = await screen.findByRole('button', { name: /hear it in reme's voice/i });
    expect(askButton).toBeDisabled();
  });
});
