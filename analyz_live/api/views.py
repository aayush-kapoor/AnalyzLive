from django.shortcuts import render
from rest_framework import viewsets
from .models import Keyword
from .serializers import KeywordSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from google.cloud import speech_v1p1beta1 as speech
import yt_dlp
from pydub import AudioSegment
import io
import os

credential_path = "/Users/aayush/Desktop/analyzlive-dc5f2201160e.json"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path

class KeywordSearchView(APIView):
    parser_classes = (JSONParser,)

    def post(self, request, *args, **kwargs):
        video_url = request.data['video_url']
        phrase = request.data['keyword']

        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
                'preferredquality': '192',
            }],
            'outtmpl': '/tmp/%(id)s.%(ext)s',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            video_id = info_dict.get("id", None)
            audio_file_path = f"/tmp/{video_id}.wav"

        audio = AudioSegment.from_file(audio_file_path)
        audio = audio.set_frame_rate(16000).set_channels(1)

        audio_bytes_io = io.BytesIO()
        audio.export(audio_bytes_io, format="wav")
        audio_content = audio_bytes_io.getvalue()

        client = speech.SpeechClient()

        audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code="en-US",
            enable_word_time_offsets=True,
        )

        response = client.recognize(config=config, audio=audio)

        phrase_words = phrase.lower().split()
        timestamps = []
        words_buffer = []

        for result in response.results:
            alternative = result.alternatives[0]
            for word_info in alternative.words:
                words_buffer.append(word_info)
                if len(words_buffer) > len(phrase_words):
                    words_buffer.pop(0)
                
                buffer_phrase = ' '.join([w.word.lower() for w in words_buffer])
                if buffer_phrase == phrase.lower():
                    timestamps.append(words_buffer[0].start_time.seconds)

        if os.path.exists(audio_file_path):
            os.remove(audio_file_path)

        return Response({"timestamps": timestamps})