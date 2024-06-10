import { IRequest } from "@/types";
import { Card, Text } from "@gluestack-ui/themed";
import Mapbox from "@rnmapbox/maps";
import { CameraRef } from "@rnmapbox/maps/lib/typescript/src/components/Camera";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import LogoIcon from "@/assets/images/Nasakh.svg";
import { useEffect } from "react";

Mapbox.setAccessToken(
  "pk.eyJ1IjoiaHZtaWRyZXhhIiwiYSI6ImNsaHBhNHlnOTA1MHQzaW9iODhyMzFmNzkifQ.V_8EC5aNqfIqzM4pACfXlw"
);

export default function MapView({
  activeRequest,
  requests,
  najiLocation,
  setLocation,
  camera,
  location,
  focus,
}: {
  activeRequest?: {
    request?: IRequest;
    role?: "NAJI" | "NASAKH";
  };
  requests: IRequest[];
  najiLocation: Position;
  setLocation?: React.Dispatch<React.SetStateAction<Position | undefined>>;
  camera: React.RefObject<CameraRef>;
  location?: number[];
  focus?: number;
}) {
  useEffect(() => {
    if (
      !activeRequest?.role &&
      location &&
      !focus &&
      camera.current?.setCamera
    ) {
      camera.current?.setCamera({
        centerCoordinate: [location[0], location[1]],
        animationDuration: 1000,
        zoomLevel: 16,
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
        camera.current?.fitBounds(najiLocation, location, 60, 500);
      else if (activeRequest?.role === "NAJI" && location)
        camera.current?.fitBounds(
          location,
          [activeRequest?.request?.long, activeRequest?.request?.lat],
          40,
          1000
        );
      else if (
        activeRequest?.role === "NASAKH" &&
        activeRequest.request.status === "SEARCHING"
      )
        camera.current?.setCamera({
          zoomLevel: 16,
          centerCoordinate: location,
          animationDuration: 2000,
          animationMode: "flyTo",
        });
  }, [activeRequest?.role, location, najiLocation]);

  useEffect(() => {
    if (focus && requests && requests[focus])
      camera.current?.setCamera({
        zoomLevel: 16,
        centerCoordinate: [requests?.[focus].long, requests?.[focus].lat],
        animationDuration: 2000,
        animationMode: "flyTo",
      });
  }, [focus]);

  return (
    <Mapbox.MapView
      zoomEnabled
      logoEnabled={false}
      scrollEnabled={!activeRequest?.role}
      scaleBarEnabled={false}
      attributionEnabled={false}
      style={{ flex: 1 }}
    >
      {!activeRequest?.request ? (
        requests?.map((item) => (
          <Mapbox.PointAnnotation
            coordinate={[item.long || 0, item.lat || 0]}
            key={`marker-${item.id}`}
            id={`marker-${item.id}`}
          >
            <Card>
              <LogoIcon width={50} height={6} />
            </Card>
          </Mapbox.PointAnnotation>
        ))
      ) : activeRequest.role === "NAJI" ? (
        <Mapbox.PointAnnotation
          coordinate={[
            activeRequest.request.long || 0,
            activeRequest.request.lat || 0,
          ]}
          key={`marker-${activeRequest.request.id}`}
          id={`marker-${activeRequest.request.id}`}
        >
          <Card>
            <LogoIcon width={50} height={6} />
          </Card>
        </Mapbox.PointAnnotation>
      ) : activeRequest?.request.status === "BRINGING" ? (
        <Mapbox.PointAnnotation
          coordinate={najiLocation}
          key={`marker-${activeRequest.request.id}`}
          id={`marker-${activeRequest.request.id}`}
        >
          <Card>
            <Text fontFamily="Vazirmatn_500Medium">ناجی</Text>
          </Card>
        </Mapbox.PointAnnotation>
      ) : null}

      <Mapbox.UserLocation
        onUpdate={(newLocation) =>
          setLocation?.([
            newLocation.coords.longitude,
            newLocation.coords.latitude,
          ])
        }
      />

      <Mapbox.Camera ref={camera} />
    </Mapbox.MapView>
  );
}
