CREATE TABLE `backlinks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`target_url` text NOT NULL,
	`source_url` text NOT NULL,
	`anchor_text` text,
	`da_score` integer,
	`cost` real DEFAULT 0,
	`status` text DEFAULT 'planned' NOT NULL,
	`acquired_date` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`site_url` text,
	`niche_category` text,
	`status` text DEFAULT 'active' NOT NULL,
	`repo_owner` text,
	`repo_name` text,
	`last_github_push` integer,
	`last_content_update` integer,
	`domain_expiry` integer,
	`domain_registrar` text,
	`hosting_platform` text,
	`hosting_account` text,
	`monetization_type` text,
	`adsense_status` text DEFAULT 'none' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
