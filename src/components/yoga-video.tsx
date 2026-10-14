import { useVideoPlayer, VideoView } from 'expo-video'
import { StyleSheet } from 'react-native'

type YogaVideoProps = {
  url: string
}

/**
 * Plays an optional routine video from a remote URL.
 * @param url HTTPS address of an mp4 the project is allowed to stream.
 */
export const YogaVideo = ({ url }: YogaVideoProps) => {
  const player = useVideoPlayer(url, (video) => {
    video.loop = false
  })
  return <VideoView style={styles.video} player={player} nativeControls />
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#241820',
  },
})
