CREATE TABLE `link_resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`type` text DEFAULT 'other' NOT NULL,
	`da_score` integer,
	`dr_score` integer,
	`price` real DEFAULT 0,
	`is_free` integer DEFAULT true,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `backlinks` ADD `resource_id` integer REFERENCES link_resources(id);