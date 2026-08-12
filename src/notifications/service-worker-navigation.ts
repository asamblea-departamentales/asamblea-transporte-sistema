export type NotificationWindowClient = {
  url: string;
  focused: boolean;
  focus: () => Promise<unknown>;
  navigate: (url: string) => Promise<NotificationWindowClient | null>;
};

export async function navigateNotificationClick(
  url: string,
  clients: readonly NotificationWindowClient[],
  openWindow: (() => Promise<unknown> | undefined) | undefined,
): Promise<unknown> {
  const sameUrlClient = clients.find((client) => client.url === url);
  if (sameUrlClient) return sameUrlClient.focus();

  const clientToUse = clients.find((client) => client.focused) ?? clients[0];
  if (clientToUse) return clientToUse.navigate(url).then((client) => client?.focus());

  return openWindow?.();
}
