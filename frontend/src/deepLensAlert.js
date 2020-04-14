import React, { useEffect, useState } from "react";
import Sockette from "sockette";
import Moment from 'react-moment';
import SplitText from 'react-pose-text';
import Alpine from 'alpinejs';

let ws = null;

const DeepLensAlert = props => {
  const { username } = props.authData;
  const [score, setScore] = useState(0);
  const [latestResult, setLatestResult] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState('connecting...');
  const [latestMessage, setLatestMessage] = useState('Loading...');
  const [lastSeenPerson, setLastSeenPerson] = useState('N/A');
  const [latestImage, setLatestImage] = useState(null);
  const [latestName, setLatestName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [images, setImages] = useState(JSON.parse(localStorage.getItem('images')) || []);

  const charPoses = {
    exit: { opacity: 0, y: 20 },
    enter: {
      opacity: 1,
      y: 0,
      delay: ({ charIndex }) => charIndex * 30
    }
  };

  useEffect(() => {
    setInterval(() => {
      localStorage.setItem('images', JSON.stringify(images));
    }, 1000)
    if (props.authData)
      ws = new Sockette(
        "wss://" + process.env.REACT_APP_WS_API_NAME + "?token=" +
        props.authData.signInUserSession.accessToken.jwtToken,
        {
          timeout: 5e3,
          maxAttempts: 1,
          // onopen: e => setLatestMessage('Connected to DeepLens!'),
          onmessage: e => onMessageReceied(e),
          onreconnect: e => setStatus('online'),
          // onmaximum: e => console.log("Stop Attempting!", e),
          // onclose: e => setStatus('offline'),
          // onerror: e => setIsLoading(false)
        }
      );
    return function cleanup() {
      ws && ws.close();
      ws = null;
    };
  }, []);

  useEffect(() => {

    if (latestResult) {
      const latestResultJson = JSON.parse(latestResult);

      console.log('LATEST JSON RESULT', latestResultJson);
      if (latestResultJson.rekognition) {
        setLastSeenPerson(latestResultJson.rekognition);
      }

      if (!isNaN(latestResultJson.confidence)) {
        setConfidence(latestResultJson.confidence.toFixed(4));
      }

      let latestProbabilityResult = 0;
      if (!isNaN(latestResultJson.prob)) {
        latestProbabilityResult = latestResultJson.prob;
      }

      if (latestProbabilityResult > 0) {
        setLatestMessage('Probility: ' + latestProbabilityResult);
      }

      if (latestResultJson.confidence < .1 && latestProbabilityResult === 0) {
        setLatestMessage('Monitoring...');
        setIsLoading(false);
        setFaceDetected(false);
      } else {
        if (latestResultJson.message) {
          setLatestMessage(latestResultJson.message);
        } else {
          setLatestMessage('Face Detected!');
          setIsLoading(true);
          setFaceDetected(true);
        }
      }

      let currentImages = images;
      if (latestResultJson.image_url) {
        currentImages.push({
          src: latestResultJson.image_url,
          // confidence: latestResult.confidence,
          name: lastSeenPerson,
          timestamp: new Date().toString()
        });
      }

      currentImages = currentImages.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
      setImages(currentImages);

      // setIsLoading(false);
      // const resultData = JSON.parse(latestResult.data);

      // let tmpuno = parseFloat(resultData.confidence);

      // // if (latestResult.confidence) {
      // console.log('got confidence', tmpuno);
      // setConfidence(0);
      // setIsLoading(false);
      // }



      // if (latestResult.image_url) {
      //   setLatestImage(latestResult.image_url);
      // }
      // if (latestResult.message) {
      //   setLatestMessage(latestResult.message);
      // }

      // if (latestResult.image_url) {
      //   let currentImages = images;
      //   currentImages.push({
      //     src: latestResult.image_url,
      //     width: 4,
      //     height: 3,
      //     confidence: latestResult.confidence,
      //     name: latestResult.name,
      //     timestamp: new Date().toString()
      //   });
      //   localStorage.setItem('images', JSON.stringify(currentImages));
      //   setImages(currentImages.reverse());
      // }
    }
  }, [latestResult])

  const onMessageReceied = ({ data }) => {
    let resultData = JSON.parse(data);
    // console.log('GOT DATA', resultData);

    // setConfidence(resultData.confidence);
    setLatestResult(resultData);
    setStatus('online');
  };

  const alertWidgetAlpineTemplate = `
  <div class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 z-10">
  <div x-data="{ show: true }" x-show="show" x-transition:enter="transform ease-out duration-300 transition" x-transition:enter-start="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2" x-transition:enter-end="translate-y-0 opacity-100 sm:translate-x-0" x-transition:leave="transition ease-in duration-100" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto">
    <div class="rounded-lg shadow-xs overflow-hidden">
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm leading-5 font-medium text-gray-900">
              Successfully saved!
            </p>
            <p class="mt-1 text-sm leading-5 text-gray-500">
              Anyone with a link can now view this file.
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button @click="show = false; setTimeout(() => show = true, 1000)" class="inline-flex text-gray-400 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `;

  const AlertWidget = () => (
    <div dangerouslySetInnerHTML={{__html: alertWidgetAlpineTemplate}} />
  );

  return (
    <section>
      <div className={`${faceDetected ? 'bg-gradient-on' : 'bg-gradient-off'} z-10 pt-6 fixed h-30`} style={{ width: '100%' }}>
        <header>

          <div className="mt-0 mb-10 mt-10 text-center gradient">
            <h3 className="text-white text-5xl text-center mega-shadow"><SplitText initialPose="exit" pose="enter" charPoses={charPoses}>{latestMessage}</SplitText></h3>
            {/* {isLoading ?
                <div className="boxes">
                  <div className="box"></div>
                  <div className="box"></div>
                  <div className="box"></div>
                  <div className="box"></div>
                  <div className="box"></div>
                  <div className="box"></div>
                  <div className="box"></div>
                  <div className="box"></div>
                  <div className="box"></div>
                </div> : ''
              } */}
          </div>

          <div>
            <div className="mt-20 grid grid-cols-1 overflow-hidden shadow md:grid-cols-3 z-20" style={{ background: 'rgba(255,255,255,.25)', borderBottom: 'solid 2px #000', borderTop: 'solid 2px #000' }}>
              <div>
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-base leading-6 font-normal text-gray-900">
                      DeepLens Status
                    </dt>
                    <dd className="mt-1">
                      <div className="text-4xl font-semibold content-center etched">
                        {status}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div>
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-base leading-6 font-normal text-gray-900">
                      Confidence Meter
                    </dt>
                    <dd className="mt-1">
                      <div className="text-4xl font-semibold content-center etched">
                        {(confidence * 100).toFixed(2)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div>
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-base leading-6 font-normal text-gray-900">
                      Last Seen
                    </dt>
                    <dd className="mt-1">
                      <div className="text-4xl font-semibold content-center etched">
                        {lastSeenPerson}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

        </header>
      </div>
      <main>
        <ul className="timeline" style={{ paddingTop: '375px' }}>
          {images.map((image, index) =>
            <li className="event" key={index}>
              <div className="date"><Moment fromNow>{image.timestamp}</Moment></div>
              <div className="flex items-center">
                <div className="flex-shrink-0 h-20 w-20 border-none">
                  <img className="h-20 w-20 shadow-xl" src={image.src} alt="" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl text-white">{image.name}</div>
                  <div className="text-xl leading-5 text-gray-500"><Moment format="MMMM DD, YYYY HH:mm:ss">{image.timestamp}</Moment></div>
                </div>
              </div>
            </li>
          )}
        </ul>
        {(images.length === 0) ?
          <h3 className="m-20 text-center text-2xl text-white">No images found.</h3>
          : ''}
      </main>
      <div className="footer">
      </div>
      <AlertWidget />
    </section>
  );
};

export default DeepLensAlert;