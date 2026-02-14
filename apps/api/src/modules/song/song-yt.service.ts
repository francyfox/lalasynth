import { Innertube } from "youtubei.js";

export const SongYtService = () => {
	let youtube: Innertube | null = null;

	async function getClient() {
		if (!youtube) {
			youtube = await Innertube.create();
		}
		return youtube;
	}

	function extractVideoId(url: string): string {
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
			/^([a-zA-Z0-9_-]{11})$/,
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) {
				return match[1];
			}
		}

		throw new Error("Invalid YouTube URL or video ID");
	}

	async function getAudioFromYouTube(urlOrId: string) {
		const videoId = extractVideoId(urlOrId);
		const yt = await getClient();
		const info = await yt.getInfo(videoId);

		// Get streaming data with formats
		const streamingData = info.streaming_data;
		if (!streamingData) {
			throw new Error("No streaming data available");
		}

		// Get best audio format
		const audioFormats = streamingData.adaptive_formats.filter(
			(f) => f.has_audio && !f.has_video,
		);

		if (audioFormats.length === 0) {
			throw new Error("No audio formats available");
		}

		// Sort by bitrate and pick the best
		const bestAudio = audioFormats.sort(
			(a, b) => (b.bitrate || 0) - (a.bitrate || 0),
		)[0];

		return {
			videoId,
			title: info.basic_info.title,
			author: info.basic_info.author,
			duration: info.basic_info.duration,
			audioUrl: bestAudio.url || "",
			mimeType: bestAudio.mime_type,
			bitrate: bestAudio.bitrate,
		};
	}

	return {
		getAudioFromYouTube,
	};
};
