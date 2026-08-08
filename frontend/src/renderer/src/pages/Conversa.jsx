import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  CircularProgress,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions'
import MicIcon from '@mui/icons-material/Mic'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ImageIcon from '@mui/icons-material/Image'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import CloseIcon from '@mui/icons-material/Close'
import StopIcon from '@mui/icons-material/Stop'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CallIcon from '@mui/icons-material/Call';
import NavBar from '../components/navbar'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback } from 'react'
import Picker from 'emoji-picker-react'
import { chatService } from "../services/chatService"

import { useAuth } from "../contexts/AuthContext";
import { toast } from 'react-hot-toast';
import { ChatSharp } from '@mui/icons-material';

import { useWebSocket } from "../contexts/WebSocketContext";

// Função para converter WebM para WAV
const convertToWav = async (webmBlob) => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Criar WAV
        const wavBuffer = audioBufferToWav(audioBuffer);
        const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
        resolve(wavBlob);
      } catch (error) {
        reject(error);
      } finally {
        audioContext.close();
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(webmBlob);
  });
};

// Função para converter AudioBuffer para WAV
const audioBufferToWav = (buffer) => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const samples = buffer.getChannelData(0);
  const dataLength = samples.length * 2;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Escrever dados
  const offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset + i * 2, intSample, true);
  }

  return arrayBuffer;
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};


export default function Conversa() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { send: sendWs, connected: wsConnected } = useWebSocket();

  // Dados da Conversa
  const [chat, setChat] = useState({});
  const [mensagens, setMensagens] = useState([]);

  // Estados para anexos
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);

  // Estados para emojis
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [message, setMessage] = useState('');

  // Estados para áudio
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Referências
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const progressContainerRef = useRef(null);
  const isDurationLoadingRef = useRef(false);
  const textFieldRef = useRef(null);

  const open = Boolean(anchorEl);
  const emojiOpen = Boolean(emojiAnchorEl);

  useEffect(()=>{
    const getChat = async () => {
      try {
        const data = await chatService.getChatData(token, id);

        console.log(data);

        setChat(data.chatData);
        setMensagens(data.messages);
      } catch (error) {
        toast.error("Erro ao capturar dados da conversa");
      }
    }

    getChat();
  }, [id]);

  const handleSendMessage = () => {
    if (!wsConnected) {
      toast.error("Conexão com o servidor indisponível.");
      return;
    }

    const texto = message.trim();

    if (!texto && selectedFiles.length === 0) {
      return;
    }

    /*
    * Por enquanto enviamos apenas texto.
    *
    * Arquivos serão tratados separadamente:
    * upload -> storage -> storage_key -> WS.
    */
    if (texto) {
      const enviado = sendWs({
        type: "message:create",

        data: {
          chat_id: Number(id),
          type: "texto",
          texto,
          reply_to: null,
        },
      });

      if (!enviado) {
        toast.error("Não foi possível enviar a mensagem.");
        return;
      }
    }

    /*
    * Arquivos
    *
    * Aqui futuramente:
    *
    * selectedFiles -> upload
    * upload -> storage_key
    * storage_key -> WS
    */

    setMessage("");
    setSelectedFiles([]);
  };

  //Drag and drop handlers
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);



  // Função para atualizar o waveform em tempo real
  const updateWaveform = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const waveform = Array.from(dataArray.slice(0, 30)).map(value =>
        Math.max(5, (value / 255) * 40)
      );
      setWaveformData(waveform);

      animationRef.current = requestAnimationFrame(updateWaveform);
    }
  };

  // Função para carregar a duração do áudio (versão corrigida)
  const loadAudioDuration = useCallback((url, retryCount = 0) => {
    // Evitar múltiplas chamadas simultâneas
    if (isDurationLoadingRef.current) {
      return Promise.resolve(audioDuration);
    }

    isDurationLoadingRef.current = true;
    setIsLoadingDuration(true);

    return new Promise((resolve) => {
      // Criar um elemento audio temporário
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.src = url;

      // Função para limpar recursos
      const cleanup = () => {
        audio.src = '';
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('error', onError);
        isDurationLoadingRef.current = false;
        setIsLoadingDuration(false);
      };

      // Evento quando os metadados são carregados
      const onLoadedMetadata = () => {
        const duration = audio.duration;
        if (!isNaN(duration) && duration > 0 && duration !== Infinity) {
          setAudioDuration(duration);
          setAudioLoaded(true);
          cleanup();
          resolve(duration);
        } else {
          cleanup();
          resolve(recordingTime || 1);
        }
      };

      // Evento de erro
      const onError = () => {
        console.warn('Erro ao carregar metadados do áudio, tentando novamente...');
        cleanup();

        // Tentar novamente até 3 vezes
        if (retryCount < 3) {
          setTimeout(() => {
            loadAudioDuration(url, retryCount + 1).then(resolve);
          }, 500);
        } else {
          // Fallback: usar o tempo de gravação
          const fallbackDuration = recordingTime || 1;
          setAudioDuration(fallbackDuration);
          setAudioLoaded(true);
          resolve(fallbackDuration);
        }
      };

      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('error', onError);

      // Timeout para evitar que fique preso
      setTimeout(() => {
        if (!audioLoaded) {
          cleanup();
          const fallbackDuration = recordingTime || 1;
          setAudioDuration(fallbackDuration);
          setAudioLoaded(true);
          resolve(fallbackDuration);
        }
      }, 3000);

      // Iniciar carregamento
      audio.load();
    });
  }, [audioDuration, audioLoaded, recordingTime]);

  // Função para processar arquivos colados (Ctrl+V)
  const handlePaste = useCallback((event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const filesToAdd = [];

    for (const item of items) {
      // Verificar se é um arquivo
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          let type = 'file';
          let icon = <InsertDriveFileIcon />;

          // Determinar o tipo baseado no MIME type
          if (file.type.startsWith('image/')) {
            type = 'image';
            icon = <ImageIcon />;
          } else if (file.type.startsWith('video/')) {
            type = 'video';
            icon = <VideoLibraryIcon />;
          }

          const fileData = {
            file,
            type,
            name: file.name || `${type}_${Date.now()}`,
            size: file.size,
            url: type === 'image' ? URL.createObjectURL(file) : null,
            videoUrl: type === 'video' ? URL.createObjectURL(file) : null,
          };

          filesToAdd.push(fileData);
        }
      }
    }

    // Adicionar arquivos ao estado
    if (filesToAdd.length > 0) {
      setSelectedFiles(prev => [...prev, ...filesToAdd]);

      // Mostrar feedback visual (opcional)
      console.log(`${filesToAdd.length} arquivo(s) colado(s):`, filesToAdd);
    }
  }, []);

  // Manipuladores de anexos
  const handleAttachClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAttachClose = () => {
    setAnchorEl(null);
  };

  const handleFileSelect = (type) => {
    switch(type) {
      case 'image':
        imageInputRef.current.click();
        break;
      case 'video':
        videoInputRef.current.click();
        break;
      case 'file':
        fileInputRef.current.click();
        break;
      default:
        break;
    }
    handleAttachClose();
  };

  const handleFileChange = (event, type) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      file,
      type,
      name: file.name,
      size: file.size,
      url: type === 'image' ? URL.createObjectURL(file) : null,
      videoUrl: type === 'video' ? URL.createObjectURL(file) : null,
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
    event.target.value = '';
  };

  const handleFileRemove = (index) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.url) URL.revokeObjectURL(fileToRemove.url);
    if (fileToRemove.videoUrl) URL.revokeObjectURL(fileToRemove.videoUrl);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreview = (file) => {
    setCurrentPreview(file);
    setPreviewDialog(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Manipuladores de emojis
  const handleEmojiClick = (event) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setEmojiAnchorEl(null);
  };

  const handleEmojiSelect = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  // Manipuladores de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Configurar AudioContext para análise
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Iniciar atualização do waveform
      updateWaveform();

      // Usar formato WebM para gravação (mais eficiente)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsConverting(true);

        try {
          // Criar blob WebM
          const webmBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current.mimeType || 'audio/webm'
          });

          // Converter para WAV
          const wavBlob = await convertToWav(webmBlob);
          const audioUrl = URL.createObjectURL(wavBlob);

          setAudioBlob(wavBlob);
          setAudioUrl(audioUrl);
          setShowRecordingUI(true);
          setAudioLoaded(false);
          setAudioDuration(0);
          setAudioProgress(0);
          setIsConverting(false);

          // Carregar a duração do áudio
          await loadAudioDuration(audioUrl);

        } catch (error) {
          console.error('Erro ao converter áudio:', error);
          setIsConverting(false);
          // Fallback: usar o blob WebM
          const webmBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorderRef.current.mimeType || 'audio/webm'
          });
          const audioUrl = URL.createObjectURL(webmBlob);
          setAudioBlob(webmBlob);
          setAudioUrl(audioUrl);
          setShowRecordingUI(true);
          await loadAudioDuration(audioUrl);
        }

        // Parar análise
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setShowRecordingUI(false);

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Por favor, permita o acesso ao microfone para gravar áudio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setShowRecordingUI(false);
    setRecordingTime(0);
    setWaveformData([]);
    setIsPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);
    setAudioLoaded(false);
    setIsLoadingDuration(false);
    isDurationLoadingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
  };

  const sendAudio = () => {
    if (audioBlob) {
      console.log('Enviando áudio:', audioBlob);
      console.log('Tamanho:', audioBlob.size, 'bytes');
      console.log('Tipo:', audioBlob.type);
      console.log('Duração:', audioDuration, 'segundos');
      console.log('Duração formatada:', formatTime(audioDuration));

      cancelRecording();
    }
  };

  const togglePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.error('Erro ao reproduzir áudio:', error);
          });
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;

      if (!isNaN(duration) && duration > 0 && duration !== Infinity) {
        const progress = (currentTime / duration) * 100;
        setAudioProgress(progress);
        if (!audioLoaded || audioDuration === 0) {
          setAudioDuration(duration);
          setAudioLoaded(true);
        }
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      if (!isNaN(duration) && duration > 0 && duration !== Infinity) {
        setAudioDuration(duration);
        setAudioLoaded(true);
        setIsLoadingDuration(false);
        isDurationLoadingRef.current = false;
      }
    }
  };

  const handleProgressClick = (event) => {
    if (!audioRef.current || !progressContainerRef.current) return;
    if (!audioLoaded) return;

    const rect = progressContainerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const duration = audioRef.current.duration || audioDuration;

    if (duration && !isNaN(duration) && duration > 0 && duration !== Infinity) {
      const newTime = percent * duration;
      audioRef.current.currentTime = newTime;
      setAudioProgress(percent * 100);
    }
  };

  const handleProgressMouseDown = (event) => {
    if (!audioLoaded) return;
    setIsDragging(true);
    handleProgressClick(event);
  };

  const handleProgressMouseMove = (event) => {
    if (!isDragging || !audioRef.current || !progressContainerRef.current) return;
    if (!audioLoaded) return;

    const rect = progressContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const duration = audioRef.current.duration || audioDuration;

    if (duration && !isNaN(duration) && duration > 0 && duration !== Infinity) {
      const newTime = x * duration;
      audioRef.current.currentTime = newTime;
      setAudioProgress(x * 100);
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const handleProgressMouseLeave = () => {
    setIsDragging(false);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity || seconds === 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };


  // Função para tecla Enter
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Configurar evento de paste no campo de texto
  useEffect(() => {
    const textField = textFieldRef.current;
    if (textField) {
      textField.addEventListener('paste', handlePaste);
      return () => {
        textField.removeEventListener('paste', handlePaste);
      };
    }
  }, [handlePaste]);

  // Limpar recursos ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      isDurationLoadingRef.current = false;
    };
  }, [audioUrl]);


  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Manipulador de drag enter
  const handleDragEnter = useCallback((e) => {
    preventDefaults(e);
    dragCounterRef.current += 1;

    // Verificar se tem arquivos sendo arrastados
    if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true);
    }
  }, []);

  // Manipulador de drag over
  const handleDragOver = useCallback((e) => {
    preventDefaults(e);
    // Mostrar feedback visual
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Manipulador de drag leave
  const handleDragLeave = useCallback((e) => {
    preventDefaults(e);
    dragCounterRef.current -= 1;

    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  // Manipulador de drop
  const handleDrop = useCallback((e) => {
    preventDefaults(e);
    dragCounterRef.current = 0;
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Determinar o tipo do arquivo
      let type = 'file';
      let icon = <InsertDriveFileIcon />;

      if (file.type.startsWith('image/')) {
        type = 'image';
        icon = <ImageIcon />;
      } else if (file.type.startsWith('video/')) {
        type = 'video';
        icon = <VideoLibraryIcon />;
      }

      const fileData = {
        file,
        type,
        name: file.name,
        size: file.size,
        url: type === 'image' ? URL.createObjectURL(file) : null,
        videoUrl: type === 'video' ? URL.createObjectURL(file) : null,
      };

      newFiles.push(fileData);
    }

    // Adicionar arquivos ao estado
    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Feedback visual
    console.log(`${newFiles.length} arquivo(s) arrastado(s):`, newFiles);
  }, []);

  function formatMessageDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - target) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (diffDays === 1) {
      return "Ontem";
    }

    if (diffDays < 7) {
      return date.toLocaleDateString("pt-BR", {
        weekday: "short",
      }).replace(".", "");
    }

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }

  function formatMessageHour(dateString, userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const hasMessages = mensagens.length > 0;

  const DragOverlay = () => {
    if (!isDragOver) return null;

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '4px dashed white',
          borderRadius: 2,
          m: 2,
          backdropFilter: 'blur(4px)',
        }}

        onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
      >
        <Box
          sx={{
            bgcolor: 'white',
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <InsertDriveFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Solte os arquivos aqui
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Imagens, vídeos ou qualquer tipo de arquivo
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <NavBar />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
      >
        {/* Cabeçalho */}
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            mt: 6,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0
          }}
        >
          <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
            <Box sx={{display: "flex"}}>
              <IconButton sx={{ ml: -1, mr: 1 }} onClick={() => navigate(-1)}>
                <ArrowBackIosNewIcon />
              </IconButton>
              <Box
                onClick={() => navigate(`/perfil/${chat.target_id}`)}
                sx={{display: "flex"}}
              >
                <Avatar
                  src={chat.avatar}
                  sx={{ mr: 2 }}
                />
                <Box sx={{ flex: 1}}>
                  <Typography fontWeight={600}>
                    {chat.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Online
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <IconButton>
                <CallIcon />
              </IconButton>
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Área de mensagens */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: 2,
            bgcolor: '#f5f5f5',
          }}
        >
          <Stack spacing={1.5}>
            {hasMessages ? mensagens.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',

                  justifyContent: msg.fromMe ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 0.8,
                    pt: 0.4,
                    pb: 0.4,
                    borderRadius: 2.5,
                    maxWidth: '80%',
                    bgcolor: msg.fromMe ? 'primary.main' : 'background.paper',
                    color: msg.fromMe ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  {msg.type == "texto" ? (
                    <Typography>{msg.texto}</Typography>
                  ) : (
                    <></>
                  )}

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      opacity: 0.75,
                    }}
                  >
                    {formatMessageHour(msg.created_at)}
                  </Typography>
                </Paper>
              </Box>
            )) : (
              <Box
                sx= {{
                  backgroundColor: "#ffff",
                  p: 5,
                  justifyContent: "center",
                  alignSelf: "center",
                  alignItems: "center",
                  borderRadius: 2.5,
                  maxWidth: '80%',
                }}
              >
                Envie uma mensagem para iniciar a conversa
              </Box>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Área de anexos selecionados */}
        {selectedFiles.length > 0 && (
          <Box
            sx={{
              p: 1,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: '#fafafa',
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              maxHeight: 100,
              overflowY: 'auto',
            }}
          >
            {selectedFiles.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => handleFileRemove(index)}
                onClick={() => handlePreview(file)}
                icon={
                  file.type === 'image' ? <ImageIcon /> :
                  file.type === 'video' ? <VideoLibraryIcon /> :
                  <InsertDriveFileIcon />
                }
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Área de gravação de áudio */}
        {isRecording && (
          <Box
            sx={{
              p: 2,
              bgcolor: '#fff3f3',
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  animation: 'pulse 1s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.5, transform: 'scale(1.2)' },
                    '100%': { opacity: 1, transform: 'scale(1)' },
                  },
                }}
              />
              <Typography variant="body2" color="error">
                {formatTime(recordingTime)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: 40 }}>
              {waveformData.length > 0 ? (
                waveformData.slice(0, 30).map((height, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 3,
                      height: `${height}px`,
                      bgcolor: 'error.main',
                      borderRadius: 1,
                      transition: 'height 0.05s',
                      minHeight: 3,
                    }}
                  />
                ))
              ) : (
                Array.from({ length: 30 }).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 3,
                      height: `${Math.random() * 20 + 5}px`,
                      bgcolor: 'error.main',
                      borderRadius: 1,
                      transition: 'height 0.05s',
                      minHeight: 3,
                    }}
                  />
                ))
              )}
            </Box>

            <IconButton
              color="error"
              onClick={stopRecording}
              sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main' } }}
            >
              <StopIcon />
            </IconButton>
          </Box>
        )}

        {/* UI de áudio gravado para envio */}
        {showRecordingUI && audioUrl && (
          <Box
            sx={{
              p: 2,
              bgcolor: '#f5f5f5',
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
              onLoadedMetadata={handleAudioLoadedMetadata}
              preload="metadata"
            />

            <IconButton onClick={togglePlayAudio} color="primary" disabled={isConverting}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" sx={{ minWidth: 40 }}>
                  {formatTime(audioRef.current?.currentTime || 0)}
                </Typography>

                {/* Barra de progresso clicável */}
                <Box
                  ref={progressContainerRef}
                  sx={{
                    flex: 1,
                    position: 'relative',
                    cursor: audioLoaded && !isConverting ? 'pointer' : 'default',
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    opacity: audioLoaded && !isConverting ? 1 : 0.5,
                  }}
                  onClick={audioLoaded && !isConverting ? handleProgressClick : undefined}
                  onMouseDown={audioLoaded && !isConverting ? handleProgressMouseDown : undefined}
                  onMouseMove={audioLoaded && !isConverting ? handleProgressMouseMove : undefined}
                  onMouseUp={audioLoaded && !isConverting ? handleProgressMouseUp : undefined}
                  onMouseLeave={audioLoaded && !isConverting ? handleProgressMouseLeave : undefined}
                >
                  <LinearProgress
                    variant="determinate"
                    value={audioProgress}
                    sx={{
                      width: '100%',
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'primary.main',
                        borderRadius: 3,
                      },
                    }}
                  />

                  {/* Bolinha de progresso */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${audioProgress}%`,
                      transform: 'translateX(-50%)',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      border: '2px solid white',
                      boxShadow: 1,
                      transition: isDragging ? 'none' : 'left 0.1s',
                      pointerEvents: 'none',
                      opacity: (isDragging || isPlaying) && audioLoaded && !isConverting ? 1 : 0.4,
                    }}
                  />
                </Box>

                <Typography variant="caption" sx={{ minWidth: 40 }}>
                  {isConverting ? (
                    <CircularProgress size={16} />
                  ) : isLoadingDuration ? (
                    <CircularProgress size={16} />
                  ) : (
                    formatTime(audioDuration)
                  )}
                </Typography>
              </Box>
            </Box>

            <IconButton onClick={cancelRecording} color="error" disabled={isConverting}>
              <DeleteIcon />
            </IconButton>

            <IconButton onClick={sendAudio} color="success" disabled={isConverting || !audioLoaded}>
              <CheckCircleIcon />
            </IconButton>
          </Box>
        )}

        {/* Caixa de envio */}
        <Box
          sx={{
            flexShrink: 0,
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            {/* Botão de anexo */}
            <IconButton onClick={handleAttachClick}>
              <AttachFileIcon />
            </IconButton>

            {/* Menu de anexos */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleAttachClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <MenuItem onClick={() => handleFileSelect('image')}>
                <ListItemIcon>
                  <ImageIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Imagem</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleFileSelect('video')}>
                <ListItemIcon>
                  <VideoLibraryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Vídeo</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleFileSelect('file')}>
                <ListItemIcon>
                  <InsertDriveFileIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Arquivo</ListItemText>
              </MenuItem>
            </Menu>

            {/* Inputs de arquivo ocultos */}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'image')}
            />
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'video')}
            />
            <input
              type="file"
              ref={fileInputRef}
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e, 'file')}
            />

            {/* Botão de emojis */}
            <IconButton onClick={handleEmojiClick}>
              <EmojiEmotionsIcon />
            </IconButton>

            {/* Popover de emojis */}
            <Popover
              open={emojiOpen}
              anchorEl={emojiAnchorEl}
              onClose={handleEmojiClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              sx={{
                '& .MuiPopover-paper': {
                  boxShadow: 3,
                  borderRadius: 2,
                  overflow: 'hidden',
                  maxHeight: 400,
                },
              }}
            >
              <Picker
                onEmojiClick={handleEmojiSelect}
                width="100%"
                height={350}
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
                searchDisabled={false}
              />
            </Popover>

            <TextField
              fullWidth
              size="small"
              placeholder="Digite uma mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isRecording || showRecordingUI || isConverting}
              inputRef={textFieldRef}
            />

            {/* Botão de microfone ou enviar */}
            {message.trim() || selectedFiles.length > 0 ? (
              <IconButton color="primary" onClick={handleSendMessage}>
                <SendIcon />
              </IconButton>
            ) : (
              <IconButton
                onClick={startRecording}
                disabled={isRecording || showRecordingUI || isConverting}
                color={isRecording ? 'error' : 'default'}
              >
                <MicIcon />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Dialog de pré-visualização */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Pré-visualização
          <IconButton
            onClick={() => setPreviewDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {currentPreview && (
            <Box sx={{ textAlign: 'center' }}>
              {currentPreview.type === 'image' && (
                <img
                  src={currentPreview.url}
                  alt={currentPreview.name}
                  style={{ maxWidth: '100%', maxHeight: '60vh' }}
                />
              )}
              {currentPreview.type === 'video' && (
                <video
                  controls
                  style={{ maxWidth: '100%', maxHeight: '60vh' }}
                >
                  <source src={currentPreview.videoUrl} />
                </video>
              )}
              {currentPreview.type === 'file' && (
                <Box>
                  <InsertDriveFileIcon sx={{ fontSize: 60 }} />
                  <Typography variant="h6">{currentPreview.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tamanho: {formatFileSize(currentPreview.size)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
      <DragOverlay/>
    </Box>
  )
}
