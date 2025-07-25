import { exec } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { logger } from '@elizaos/core';

const execAsync = promisify(exec);

// Lazy load whisper-node to avoid ESM/CommonJS issues
let whisperModule: any = null;
async function getWhisper() {
  if (!whisperModule) {
    // Dynamic import for CommonJS module
    const module = await import('whisper-node');
    // The module exports an object with a whisper property
    whisperModule = (module as any).whisper;
  }
  return whisperModule;
}

/**
 * Interface representing the result of a transcription process.
 * @interface
 * @property {string} text - The transcribed text.
 */
interface TranscriptionResult {
  text: string;
}

/**
 * Class representing a TranscribeManager.
 *
 * @property {TranscribeManager | null} instance - The singleton instance of the TranscribeManager class.
 * @property {string} cacheDir - The directory path for caching transcribed files.
 * @property {boolean} ffmpegAvailable - Flag indicating if ffmpeg is available for audio processing.
 * @property {string | null} ffmpegVersion - The version of ffmpeg if available.
 * @property {string | null} ffmpegPath - The path to the ffmpeg executable.
 * @property {boolean} ffmpegInitialized - Flag indicating if ffmpeg has been initialized.
 *
 * @constructor
 * Creates an instance of TranscribeManager with the specified cache directory.
 */
export class TranscribeManager {
  private static instance: TranscribeManager | null = null;
  private cacheDir: string;
  private ffmpegAvailable = false;
  private ffmpegVersion: string | null = null;
  private ffmpegPath: string | null = null;
  private ffmpegInitialized = false;

  /**
   * Constructor for TranscribeManager class.
   *
   * @param {string} cacheDir - The directory path for storing cached files.
   */
  private constructor(cacheDir: string) {
    this.cacheDir = path.join(cacheDir, 'whisper');
    logger.debug('Initializing TranscribeManager', {
      cacheDir: this.cacheDir,
      timestamp: new Date().toISOString(),
    });
    this.ensureCacheDirectory();
  }

  /**
   * Ensures that FFmpeg is initialized and available for use.
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating if FFmpeg is available.
   */
  public async ensureFFmpeg(): Promise<boolean> {
    if (!this.ffmpegInitialized) {
      try {
        await this.initializeFFmpeg();
        this.ffmpegInitialized = true;
      } catch (error) {
        logger.error('FFmpeg initialization failed:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString(),
        });
        return false;
      }
    }
    return this.ffmpegAvailable;
  }

  /**
   * Checks if FFmpeg is available.
   * @returns {boolean} True if FFmpeg is available, false otherwise.
   */
  public isFFmpegAvailable(): boolean {
    return this.ffmpegAvailable;
  }

  /**
   * Asynchronously retrieves the FFmpeg version if it hasn't been fetched yet.
   * If the FFmpeg version has already been fetched, it will return the stored version.
   * @returns A Promise that resolves with the FFmpeg version as a string, or null if the version is not available.
   */
  public async getFFmpegVersion(): Promise<string | null> {
    if (!this.ffmpegVersion) {
      await this.fetchFFmpegVersion();
    }
    return this.ffmpegVersion;
  }

  /**
   * Fetches the FFmpeg version by executing the command "ffmpeg -version".
   * Updates the class property ffmpegVersion with the retrieved version.
   * Logs the FFmpeg version information or error message.
   * @returns {Promise<void>} A Promise that resolves once the FFmpeg version is fetched and logged.
   */
  private async fetchFFmpegVersion(): Promise<void> {
    try {
      const { stdout } = await execAsync('ffmpeg -version');
      this.ffmpegVersion = stdout.split('\n')[0];
      logger.info('FFmpeg version:', {
        version: this.ffmpegVersion,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.ffmpegVersion = null;
      logger.error('Failed to get FFmpeg version:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Initializes FFmpeg by performing the following steps:
   * 1. Checks for FFmpeg availability in PATH
   * 2. Retrieves FFmpeg version information
   * 3. Verifies FFmpeg capabilities
   *
   * If FFmpeg is available, logs a success message with version, path, and timestamp.
   * If FFmpeg is not available, logs installation instructions.
   *
   * @returns A Promise that resolves once FFmpeg has been successfully initialized
   */
  private async initializeFFmpeg(): Promise<void> {
    try {
      // First check if ffmpeg exists in PATH
      await this.checkFFmpegAvailability();

      if (this.ffmpegAvailable) {
        // Get FFmpeg version info
        await this.fetchFFmpegVersion();

        // Verify FFmpeg capabilities
        await this.verifyFFmpegCapabilities();

        logger.success('FFmpeg initialized successfully', {
          version: this.ffmpegVersion,
          path: this.ffmpegPath,
          timestamp: new Date().toISOString(),
        });
      } else {
        this.logFFmpegInstallInstructions();
      }
    } catch (error) {
      this.ffmpegAvailable = false;
      logger.error('FFmpeg initialization failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
      this.logFFmpegInstallInstructions();
    }
  }

  /**
   * Asynchronously checks for the availability of FFmpeg in the system by executing a command to find the FFmpeg location.
   * Updates the class properties `ffmpegPath` and `ffmpegAvailable` accordingly.
   * Logs relevant information such as FFmpeg location and potential errors using the logger.
   *
   * @returns A Promise that resolves with no value upon completion.
   */
  private async checkFFmpegAvailability(): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync('which ffmpeg || where ffmpeg');
      this.ffmpegPath = stdout.trim();
      this.ffmpegAvailable = true;
      logger.info('FFmpeg found at:', {
        path: this.ffmpegPath,
        stderr: stderr ? stderr.trim() : undefined,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.ffmpegAvailable = false;
      this.ffmpegPath = null;
      logger.error('FFmpeg not found in PATH:', {
        error: error instanceof Error ? error.message : String(error),
        stderr: error instanceof Error && 'stderr' in error ? error.stderr : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Verifies the FFmpeg capabilities by checking if FFmpeg supports the required codecs and formats.
   *
   * @returns {Promise<void>} A Promise that resolves if FFmpeg has the required codecs, otherwise rejects with an error message.
   */
  private async verifyFFmpegCapabilities(): Promise<void> {
    try {
      // Check if FFmpeg supports required codecs and formats
      const { stdout } = await execAsync('ffmpeg -codecs');
      const hasRequiredCodecs = stdout.includes('pcm_s16le') && stdout.includes('wav');

      if (!hasRequiredCodecs) {
        throw new Error('FFmpeg installation missing required codecs (pcm_s16le, wav)');
      }

      // logger.info("FFmpeg capabilities verified", {
      //   hasRequiredCodecs,
      //   timestamp: new Date().toISOString()
      // });
    } catch (error) {
      logger.error('FFmpeg capabilities verification failed:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  /**
   * Logs instructions on how to install FFmpeg if it is not properly installed.
   */
  private logFFmpegInstallInstructions(): void {
    logger.warn('FFmpeg is required but not properly installed. Please install FFmpeg:', {
      instructions: {
        mac: 'brew install ffmpeg',
        ubuntu: 'sudo apt-get install ffmpeg',
        windows: 'choco install ffmpeg',
        manual: 'Download from https://ffmpeg.org/download.html',
      },
      requiredVersion: '4.0 or later',
      requiredCodecs: ['pcm_s16le', 'wav'],
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Gets the singleton instance of TranscribeManager, creates a new instance if it doesn't exist.
   *
   * @param {string} cacheDir - The directory path for caching transcriptions.
   * @returns {TranscribeManager} The singleton instance of TranscribeManager.
   */
  public static getInstance(cacheDir: string): TranscribeManager {
    if (!TranscribeManager.instance) {
      TranscribeManager.instance = new TranscribeManager(cacheDir);
    }
    return TranscribeManager.instance;
  }

  /**
   * Ensures that the cache directory exists. If it doesn't exist,
   * creates the directory using fs.mkdirSync with recursive set to true.
   * @returns {void}
   */
  private ensureCacheDirectory(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      // logger.info("Created whisper cache directory:", this.cacheDir);
    }
  }

  /**
   * Converts an audio file to WAV format using FFmpeg.
   *
   * @param {string} inputPath - The input path of the audio file to convert.
   * @param {string} outputPath - The output path where the converted WAV file will be saved.
   * @returns {Promise<void>} A Promise that resolves when the conversion is completed.
   * @throws {Error} If FFmpeg is not installed or not properly configured, or if the audio conversion fails.
   */
  private async convertToWav(inputPath: string, outputPath: string): Promise<void> {
    if (!this.ffmpegAvailable) {
      throw new Error(
        'FFmpeg is not installed or not properly configured. Please install FFmpeg to use audio transcription.'
      );
    }

    try {
      // Add -loglevel error to suppress FFmpeg output unless there's an error
      const { stderr } = await execAsync(
        `ffmpeg -y -loglevel error -i "${inputPath}" -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}"`
      );

      if (stderr) {
        logger.warn('FFmpeg conversion error:', {
          stderr,
          inputPath,
          outputPath,
          timestamp: new Date().toISOString(),
        });
      }

      if (!fs.existsSync(outputPath)) {
        throw new Error('WAV file was not created successfully');
      }
    } catch (error) {
      logger.error('Audio conversion failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        command: `ffmpeg -y -loglevel error -i "${inputPath}" -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}"`,
        ffmpegAvailable: this.ffmpegAvailable,
        ffmpegVersion: this.ffmpegVersion,
        ffmpegPath: this.ffmpegPath,
        timestamp: new Date().toISOString(),
      });
      throw new Error(
        `Failed to convert audio to WAV format: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Asynchronously preprocesses the audio by converting the provided audio buffer into a WAV file.
   * If FFmpeg is not installed, an error is thrown.
   *
   * @param {Buffer} audioBuffer The audio buffer to preprocess
   * @returns {Promise<string>} The path to the preprocessed WAV file
   * @throws {Error} If FFmpeg is not installed or if audio preprocessing fails
   */
  private async preprocessAudio(audioBuffer: Buffer): Promise<string> {
    if (!this.ffmpegAvailable) {
      throw new Error('FFmpeg is not installed. Please install FFmpeg to use audio transcription.');
    }

    try {
      // Check if the buffer is already a WAV file
      const isWav =
        audioBuffer.length > 4 &&
        audioBuffer.toString('ascii', 0, 4) === 'RIFF' &&
        audioBuffer.length > 12 &&
        audioBuffer.toString('ascii', 8, 12) === 'WAVE';

      // Use appropriate extension based on format detection
      const extension = isWav ? '.wav' : '';
      const tempInputFile = path.join(this.cacheDir, `temp_input_${Date.now()}${extension}`);
      const tempWavFile = path.join(this.cacheDir, `temp_${Date.now()}.wav`);

      // logger.info("Creating temporary files", {
      //   inputFile: tempInputFile,
      //   wavFile: tempWavFile,
      //   bufferSize: audioBuffer.length,
      //   timestamp: new Date().toISOString()
      // });

      // Write buffer to temporary file
      fs.writeFileSync(tempInputFile, audioBuffer);
      // logger.info("Temporary input file created", {
      //   path: tempInputFile,
      //   size: audioBuffer.length,
      //   timestamp: new Date().toISOString()
      // });

      // If already WAV with correct format, skip conversion
      if (isWav) {
        // Check if it's already in the correct format (16kHz, mono, 16-bit)
        try {
          const { stdout } = await execAsync(
            `ffprobe -v error -show_entries stream=sample_rate,channels,bits_per_raw_sample -of json "${tempInputFile}"`
          );
          const probeResult = JSON.parse(stdout);
          const stream = probeResult.streams?.[0];

          if (
            stream?.sample_rate === '16000' &&
            stream?.channels === 1 &&
            (stream?.bits_per_raw_sample === 16 || stream?.bits_per_raw_sample === undefined)
          ) {
            // Already in correct format, just rename
            fs.renameSync(tempInputFile, tempWavFile);
            return tempWavFile;
          }
        } catch (probeError) {
          // If probe fails, continue with conversion
          logger.debug('FFprobe failed, continuing with conversion:', probeError);
        }
      }

      // Convert to WAV format
      await this.convertToWav(tempInputFile, tempWavFile);

      // Clean up the input file
      if (fs.existsSync(tempInputFile)) {
        fs.unlinkSync(tempInputFile);
        // logger.info("Temporary input file cleaned up", {
        //   path: tempInputFile,
        //   timestamp: new Date().toISOString()
        // });
      }

      return tempWavFile;
    } catch (error) {
      logger.error('Audio preprocessing failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ffmpegAvailable: this.ffmpegAvailable,
        timestamp: new Date().toISOString(),
      });
      throw new Error(
        `Failed to preprocess audio: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Transcribes the audio buffer to text using whisper.
   *
   * @param {Buffer} audioBuffer The audio buffer to transcribe.
   * @returns {Promise<TranscriptionResult>} A promise that resolves with the transcription result.
   * @throws {Error} If FFmpeg is not installed or properly configured.
   */

  public async transcribe(audioBuffer: Buffer): Promise<TranscriptionResult> {
    await this.ensureFFmpeg();

    if (!this.ffmpegAvailable) {
      throw new Error(
        'FFmpeg is not installed or not properly configured. Please install FFmpeg to use audio transcription.'
      );
    }

    try {
      // Preprocess audio to WAV format
      const wavFile = await this.preprocessAudio(audioBuffer);

      logger.info('Starting transcription with whisper...');

      let segments;
      try {
        // Get the whisper function
        const whisper = await getWhisper();

        // Transcribe using whisper-node
        segments = await whisper(wavFile, {
          modelName: 'tiny',
          modelPath: path.join(this.cacheDir, 'models'), // Specify where to store models
          whisperOptions: {
            language: 'en',
            word_timestamps: false, // We don't need word-level timestamps
          },
        });
      } catch (whisperError) {
        // Check if it's a model download issue
        const errorMessage =
          whisperError instanceof Error ? whisperError.message : String(whisperError);
        if (errorMessage.includes('not found') || errorMessage.includes('download')) {
          logger.error('Whisper model not found. Please run: npx whisper-node download');
          throw new Error(
            'Whisper model not found. Please install it with: npx whisper-node download'
          );
        }

        // For other errors, log and rethrow
        logger.error('Whisper transcription error:', whisperError);
        throw whisperError;
      }

      // Clean up temporary WAV file
      if (fs.existsSync(wavFile)) {
        fs.unlinkSync(wavFile);
        logger.info('Temporary WAV file cleaned up');
      }

      // Check if segments is valid
      if (!segments || !Array.isArray(segments)) {
        logger.warn('Whisper returned no segments (likely silence or very short audio)');
        // Return empty transcription for silent/empty audio
        return { text: '' };
      }

      // Handle empty segments array
      if (segments.length === 0) {
        logger.warn('No speech detected in audio');
        return { text: '' };
      }

      // Combine all segments into a single text
      const cleanText = segments
        .map((segment: any) => segment.speech?.trim() || '')
        .filter((text: string) => text) // Remove empty segments
        .join(' ');

      logger.success('Transcription complete:', {
        textLength: cleanText.length,
        segmentCount: segments.length,
        timestamp: new Date().toISOString(),
      });

      return { text: cleanText };
    } catch (error) {
      logger.error('Transcription failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ffmpegAvailable: this.ffmpegAvailable,
      });
      throw error;
    }
  }
}
