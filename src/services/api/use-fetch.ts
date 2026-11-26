"use client";

import { useCallback } from "react";
import { AUTH_REFRESH_URL } from "./config";
import { FetchInputType, FetchInitType } from "./types/fetch-params";
import useLanguage from "../i18n/use-language";
import {
  getTokensInfo,
  setTokensInfo,
  SESSION_EXPIRED_EVENT,
} from "../auth/auth-tokens-info";

let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const tokens = getTokensInfo();
      const response = await fetch(AUTH_REFRESH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.refreshToken}`,
        },
      });

      const newTokens = await response.json();

      if (newTokens.token) {
        setTokensInfo({
          token: newTokens.token,
          refreshToken: newTokens.refreshToken,
          tokenExpires: newTokens.tokenExpires,
        });
      }
    } catch {
      // Refresh failed — callers will proceed with current token
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function useFetch() {
  const language = useLanguage();

  return useCallback(
    async (input: FetchInputType, init?: FetchInitType) => {
      const tokens = getTokensInfo();

      let headers: HeadersInit = {
        "x-custom-lang": language,
      };

      if (!(init?.body instanceof FormData)) {
        headers = {
          ...headers,
          "Content-Type": "application/json",
        };
      }

      if (tokens?.token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${tokens.token}`,
        };
      }

      if (tokens?.tokenExpires && tokens.tokenExpires - 60000 <= Date.now()) {
        await refreshTokens();
        const refreshedTokens = getTokensInfo();
        if (refreshedTokens?.token) {
          headers = {
            ...headers,
            Authorization: `Bearer ${refreshedTokens.token}`,
          };
        }
      }

      const response = await fetch(input, {
        ...init,
        headers: {
          ...headers,
          ...init?.headers,
        },
      });

      // Havia sessão e o servidor a recusou: limpa os tokens e avisa o
      // AuthProvider, que zera o usuário e os guards levam ao login.
      if (response.status === 401 && getTokensInfo()?.token) {
        setTokensInfo(null);
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }

      return response;
    },
    [language]
  );
}

export default useFetch;
