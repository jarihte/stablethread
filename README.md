![StableThread Logo](https://stablethread.com/images/stablethread.png)

## StableThread

StableThead is a Solana Pay platform for QR generation and real-time payment notifications.

### Providers
* [Solana Pay](https://solanapay.com)
* [Helius RPC and Webhook](https://helius.xyz)
### Grizzlython
* Created for the [Solana Grizzython Hackathon](https://solana.com/grizzlython)
* Inspired by [Jon Wong](https://build.superteam.fun/article/build-a-webhook-service-for-solana-pay)

### Links
* Live at [StableThread](https://stablethread.com)
* Live example at [CircleSub](https://circlesub.com/tip/komdodx)

### Required ENV Vars:
* HELIUS_RPC={Solana RPC HTTPS URL}
* HELIUS_API_KEY={Helius API Key}
* HELIUS_WEBHOOK_ID={Helius Webhook ID}
* HELIUS_WEBHOOK_SECRET={Helius Webhook Secret}
* DOMAIN_URL={Domain Name of running service - e.g. stablethread.com - must be on HTTPS}
* BANK_ADDRESS={Solana Wallet Address for Bank to collect fees}
* FEE_AMOUNT={Fee amount in SOL - e.g. 0.01}
* FEE_PERCENTAGE={Fee percentage - e.g. 0.7 for 70%}
