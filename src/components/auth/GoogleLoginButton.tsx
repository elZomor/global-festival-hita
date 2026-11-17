'use client';
import { GoogleLogin } from '@react-oauth/google';
import { useT } from '../../i18n/useT';

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
  const t = useT();

  if (isInAppBrowser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h3 className="text-xl font-semibold text-primary-950 dark:text-primary-50 mb-3">
          {t('auth.unsupportedBrowser')}
        </h3>
        <p className="text-primary-600 dark:text-primary-300 mb-6">{t('auth.unsupportedBrowserMsg')}</p>
        <button
          onClick={openExternalBrowser}
          className="min-h-11 px-6 py-3 rounded-[3px] bg-ember-500 text-primary-950 font-semibold hover:bg-ember-400 transition-colors"
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
