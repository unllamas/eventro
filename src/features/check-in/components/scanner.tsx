import * as React from 'react';
import NimiqQrScanner from 'qr-scanner';
// import { QrScannerProps } from './types'

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    width: '100%',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'fixed',
  },
  video: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    overflow: 'hidden',
    position: 'absolute',
  },
};

export const QrScanner = (props: QrScannerProps) => {
  const {
    className,
    containerStyle,
    videoContainerStyle,
    videoStyle,
    videoId,
    ViewFinder,
    startOnLaunch,
    onMount,
    onScan,
    onDecode,
    onDecodeError,
    calculateScanRegion,
    preferredCamera,
    maxScansPerSecond,
    highlightScanRegion,
    highlightCodeOutline,
    overlay,
    returnDetailedScanResult,
  } = props;

  const video = React.createRef<HTMLVideoElement>();

  // const test = async () => {
  //   const test = await NimiqQrScanner.listCameras(true)
  //   alert(JSON.stringify(test))
  // }

  React.useEffect(() => {
    // test()
    if (video.current) {
      // create scanner bound to video html element
      const target = video.current;

      const scanner = new NimiqQrScanner(
        target,
        (result) => {
          if (onDecode) onDecode(result);
          if (onScan) onScan(result);
        },
        {
          onDecodeError: (error) => {
            if (onDecodeError) onDecodeError(error);
            if (onScan) onScan(undefined, error);
          },
          calculateScanRegion,
          preferredCamera,
          maxScansPerSecond,
          highlightScanRegion,
          highlightCodeOutline,
          overlay,
          returnDetailedScanResult,
        }
      );

      if (startOnLaunch) {
        scanner.setInversionMode('both');
        scanner.start().then(
          () => {
            /*Started successfully*/
          },
          (err) => console.log('Error starting scanner: ', err)
        );
      }

      if (onMount) onMount(scanner);

      return () => {
        scanner.destroy();
      };
    }
  }, []);

  return (
    <section className={className} style={containerStyle}>
      <div
        style={{
          ...styles.container,
          ...videoContainerStyle,
        }}
      >
        {!!ViewFinder && <ViewFinder />}
        <video
          ref={video}
          muted
          id={videoId}
          style={{
            ...styles.video,
            ...videoStyle,
          }}
        />
      </div>
    </section>
  );
};

interface QrScannerProps {
  /**
   * Media track constraints object, to specify which camera and capabilities to use
   */
  constraints?: MediaTrackConstraints;
  /**
   * Property that represents an optional className to modify styles
   */
  className?: string;
  /**
   * Property that represents a style for the container
   */
  containerStyle?: any;
  /**
   * Property that represents a style for the video container
   */
  videoContainerStyle?: any;
  /**
   * Property that represents a style for the video
   */
  videoStyle?: any;
  /**
   * Property that represents the ID of the video element
   */
  videoId?: string;
  /**
   * Property that represents the view finder component
   */
  ViewFinder?: (props: any) => React.ReactElement<any, any> | null;
  /**
   * Start the camera as soon as the component mounts?
   */
  startOnLaunch?: boolean;
  /**
   * A handler to receive the underlying scan controller
   */
  onMount?: (controller: NimiqQrScanner) => void;
  /**
   * A handler that can handle both successful and unsuccessful scans
   */
  onScan?: (result?: NimiqQrScanner.ScanResult, error?: Error | string) => void;
  /**
   * A handler for successful scans
   */
  onDecode?: (result: NimiqQrScanner.ScanResult) => void;
  /**
   * A handler for unsuccessful scans
   */
  onDecodeError?: (error: Error | string) => void;
  /**
   *
   */
  calculateScanRegion?: (video: HTMLVideoElement) => NimiqQrScanner.ScanRegion;
  /**
   * The preffered camera, will attempt to use this first
   */
  preferredCamera?: NimiqQrScanner.FacingMode | NimiqQrScanner.DeviceId;
  /**
   *
   */
  maxScansPerSecond?: number;
  /**
   *
   */
  highlightScanRegion?: boolean;
  /**
   *
   */
  highlightCodeOutline?: boolean;
  /**
   *
   */
  overlay?: HTMLDivElement;
  /** just a temporary flag until we switch entirely to the new api */
  returnDetailedScanResult?: true;
}
