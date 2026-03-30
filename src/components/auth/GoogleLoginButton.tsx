'use client';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';

type Props = {
  onSuccess: (credential: string) => Promise<void>;
  onError?: () => void;
};

const isInAppBrowser = /FBAN|FBAV|Instagram|Messenger|WhatsApp|Snapchat|Twitter/i.test(
  navigator.userAgent
);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

export const openExternalBrowser = () => {
  const currentUrl = window.location.href;
  if (isIOS) {
    window.location.href = `x-safari-https://${currentUrl.replace(/^https?:\/\//, '')}`;
  } else {
    const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`;
    window.open(intentUrl, '_blank');
  }
};

export { isInAppBrowser };

export const GoogleLoginButton = ({ onSuccess, onError }: Props) => {
  const { t } = useTranslation();

  if (isInAppBrowser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {t('auth.unsupportedBrowser')}
        </h3>
        <p className="text-gray-600 mb-6">{t('auth.unsupportedBrowserMsg')}</p>
        <button
          onClick={openExternalBrowser}
          className="px-6 py-3 bg-purple-500 text-white rounded-md shadow hover:bg-purple-600 transition-all duration-300"
        >
          {t('auth.openInBrowser')}
        </button>
      </div>
    );
  }

  return (
    // cursor:pointer + touch-action:manipulation are required for iOS Safari to fire
    // click/tap events on iframe-based elements like the Google OAuth button.
    <div style={{ cursor: 'pointer', touchAction: 'manipulation' }}>
      <GoogleLogin
        onSuccess={async ({ credential }) => {
          if (credential) await onSuccess(credential);
        }}
        onError={onError ?? (() => {})}
      />
    </div>
  );
};
