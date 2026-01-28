CREATE TABLE `github_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`token` text NOT NULL,
	`token_expires_at` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `github_account_id` integer REFERENCES github_accounts(id);