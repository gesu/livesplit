if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}

import './css/main.scss';
import('./css/font-awesome.css');

import { createRoot } from 'react-dom/client';
import { WagmiConfig, createConfig } from 'wagmi';
import { getDefaultConfig, ConnectKitProvider } from 'connectkit';
import { baseGoerli } from 'wagmi/chains';

const config = createConfig(
    getDefaultConfig({
        appName: 'speedrun',
        alchemyId: 'FM-HvNX6Wfdaa_NoDFlBUcZ1ab_KkAdA',
        walletConnectProjectId: '79c8704ab45ea25a56a0465d4cda96f4',
        chains: [baseGoerli],
    }),
);

try {
    const [{ LiveSplit }, React, ReactDOM, { toast, ToastContainer }] = await Promise.all([
        import('./ui/LiveSplit'),
        import('react'),
        import('react-dom'),
        import('react-toastify'),
    ]);

    try {
        const { splits, splitsKey, layout, hotkeys, layoutWidth } =
            await LiveSplit.loadStoredData();

        function requestWakeLock() {
            try {
                (navigator as any)?.wakeLock?.request('screen');
            } catch {
                // It's fine if it fails.
            }
        }

        requestWakeLock();

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        });

        const root = createRoot(document.getElementById('base')!);

        root.render(
            <div>
                <WagmiConfig config={config}>
                    <ConnectKitProvider>
                        <LiveSplit
                            splits={splits}
                            layout={layout}
                            hotkeys={hotkeys}
                            splitsKey={splitsKey}
                            layoutWidth={layoutWidth}
                        />
                        <ToastContainer
                            position={toast.POSITION.BOTTOM_RIGHT}
                            toastClassName='toast-class'
                            bodyClassName='toast-body'
                            style={{
                                textShadow: 'none',
                            }}
                        />
                    </ConnectKitProvider>
                </WagmiConfig>
            </div>,
        );
    } catch (e: any) {
        if (e.name === 'InvalidStateError') {
            alert(`Couldn't load LiveSplit One. \
You may be in private browsing mode. \
LiveSplit One cannot store any splits, layouts, or other settings because of the limitations of the browser's private browsing mode. \
These limitations may be lifted in the future. \
To run LiveSplit One for now, please disable private browsing in your settings.\n`);
        }
    }
} catch (_) {
    alert(`Couldn't load LiveSplit One. \
You may be using a browser that is not up to date. \
Please update your browser or your iOS version and try again. \
Another reason might be that a browser extension, such as an adblocker, \
is blocking access to important scripts.`);
}
