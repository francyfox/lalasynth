CREATE TABLE `local_song` (
	`filename` text PRIMARY KEY NOT NULL,
	`lrc_filename` text,
	`title` text NOT NULL,
	`artist` text,
	`album_art` text,
	`duration` integer,
	`bitrate` integer,
	`mime_type` text NOT NULL,
	`waveform_bars` text,
	`indexed_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
