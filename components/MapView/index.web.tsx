import { IRequest } from "@/types";
import mapboxgl from "mapbox-gl";
import { createRef, useEffect, useRef } from "react";
import { Card, Text } from "@gluestack-ui/themed";
import LogoIcon from "@/assets/images/Nasakh.svg";
import ReactMapboxGl, { Layer, Feature, Marker } from "react-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const Map = ReactMapboxGl({
  accessToken:
    "pk.eyJ1IjoiaHZtaWRyZXhhIiwiYSI6ImNsaHBhNHlnOTA1MHQzaW9iODhyMzFmNzkifQ.V_8EC5aNqfIqzM4pACfXlw",
});

export default function MapView({
  activeRequest,
  requests,
  najiLocation,
  setLocation,
  location,
}: {
  activeRequest?: {
    request?: IRequest;
    role?: "NAJI" | "NASAKH";
  };
  requests: IRequest[];
  najiLocation: number[];
  setLocation?: React.Dispatch<React.SetStateAction<number[] | undefined>>;
  location: number[];
}) {
  const ref = useRef<any>();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation?.([position.coords.longitude, position.coords.latitude]);
      });
    }
  }, [navigator.geolocation]);
  useEffect(() => {
    if (
      !activeRequest?.role &&
      location &&
      !focus &&
      ref.current.state?.map?.flyTo
    ) {
      ref.current.state?.map?.flyTo({
        center: [location[0], location[1]],
        duration: 1000,
        zoom: 16,
      });
    }
  }, [activeRequest, location]);
  useEffect(() => {
    if (activeRequest?.request)
      if (
        activeRequest?.role === "NASAKH" &&
        activeRequest.request.status === "BRINGING" &&
        location
      )
        ref.current.state?.map?.fitBounds(
          [najiLocation[0], najiLocation[1], location[0], location[1]],
          { padding: 60, duration: 500 }
        );
      else if (activeRequest?.role === "NAJI" && location)
        ref.current.state?.map?.fitBounds(
          [
            location[0],
            location[1],
            activeRequest?.request?.long,
            activeRequest?.request?.lat,
          ],

          { padding: 40, duration: 1000 }
        );
      else if (
        activeRequest?.role === "NASAKH" &&
        activeRequest.request.status === "SEARCHING"
      )
        ref.current.state?.map?.flyTo({
          zoom: 16,
          center: [location[0], location[1]],
          duration: 2000,
        });
  }, [activeRequest?.role, location, najiLocation]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <Map
        ref={ref}
        center={[location?.[0] || 0, location?.[1] || 0]}
        containerStyle={{ flex: 1 }}
        style="mapbox://styles/hvmidrexa/clhqfg2ex01w701qyfi6r1i2m"
        zoom={[16]}
        onStyleLoad={(map) => {
          const geo = new mapboxgl.GeolocateControl({
            showUserLocation: true,
            trackUserLocation: true,
          });
          map.resize();
          map.addControl(geo, "top-left");
        }}
      >
        {!activeRequest?.request ? (
          requests?.map((item) => (
            <Marker
              coordinates={[item.long, item.lat]}
              key={`marker-${item.id}`}
              style={{ zIndex: 0 }}
            >
              <Card>
                <LogoIcon width={50} height={6} />
              </Card>
            </Marker>
          ))
        ) : activeRequest.role === "NAJI" ? (
          <Marker
            style={{ zIndex: 0 }}
            coordinates={[
              activeRequest.request.long,
              activeRequest.request.lat,
            ]}
            key={`marker-${activeRequest.request.id}`}
          >
            <Card>
              <LogoIcon width={50} height={6} />
            </Card>
          </Marker>
        ) : activeRequest?.request.status === "BRINGING" ? (
          <Marker
            style={{ zIndex: 0 }}
            coordinates={[najiLocation[0], najiLocation[1]]}
            key={`marker-${activeRequest.request.id}`}
          >
            <Card>
              <Text fontFamily="Vazirmatn_500Medium">ناجی</Text>
            </Card>
          </Marker>
        ) : (
          <></>
        )}
      </Map>
    </div>
  );
}
