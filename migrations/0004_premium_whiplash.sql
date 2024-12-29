DROP TABLE `tags`;--> statement-breakpoint
DROP INDEX "users_username_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `comments` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (UNIXEPOCH());--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `likes` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (UNIXEPOCH());--> statement-breakpoint
ALTER TABLE `posts` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT (UNIXEPOCH());--> statement-breakpoint
ALTER TABLE `posts` ADD `view_count` integer DEFAULT 0;