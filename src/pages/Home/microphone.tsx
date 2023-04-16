import { AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const Dictaphone = (props: { setMessage: any }) => {
  // const  {setMessage}  = props;
  const { clickFunction } = props;
  const [isListening, setisListening] = useState(false);
  const { interimTranscript, finalTranscript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (finalTranscript !== '') {
      clickFunction(finalTranscript);
    }
  }, [interimTranscript, finalTranscript]);
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null;
  }

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    console.log(
      'Your browser does not support speech recognition software! Try Chrome desktop, maybe?',
    );
  }
  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: navigator.language,
    });
  };
  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleListen = () => {
    console.log('isListening', isListening);
    if (!isListening) {
      startListening();
      setisListening(!isListening);
    } else {
      stopListening();
      resetTranscript();
      setisListening(!isListening);
    }
  };
  return (
    <Button
      type="dashed"
      icon={isListening ? <AudioOutlined /> : <AudioMutedOutlined />}
      size="large"
      onClick={() => handleListen()}
    />
  );
};

export default Dictaphone;
