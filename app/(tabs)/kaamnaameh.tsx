import {
  AddIcon,
  Button,
  Card,
  CloseIcon,
  Divider,
  Fab,
  FabIcon,
  FabLabel,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pressable,
  ScrollView,
  Text,
  View,
} from "@gluestack-ui/themed";
import { FlashList } from "@shopify/flash-list";
import { useContext, useEffect, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import StackGrid, { Grid } from "react-stack-grid";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import axiosInstance from "@/lib/Instance";
import WriteLetterModal from "@/components/Modals/WriteLetter";
import { UserContext } from "@/components/Contexts/Contexts";
import isCloseToBottom from "@/lib/nearEnd";
import ReadLetterModal from "@/components/Modals/ReadLetter";

const AddLetter = ({
  onCloseEvent,
  mode,
}: {
  onCloseEvent: () => void;
  mode: "PUBLIC" | "PRIVATE";
}) => {
  const [openWriteModal, setOpenWriteModal] = useState<boolean>(false);
  return (
    <>
      <WriteLetterModal
        mode={mode}
        setOpenWriteModal={setOpenWriteModal}
        openWriteModal={openWriteModal}
        onClose={() => {
          setOpenWriteModal(false);
          onCloseEvent();
        }}
      />
      <Fab
        onPress={() => {
          setOpenWriteModal(true);
        }}
        backgroundColor="$black"
      >
        <FabLabel>
          <Text color="white" fontFamily="Vazirmatn_700Bold">
            بنویس
          </Text>
        </FabLabel>
        <FabIcon as={AddIcon} ml={"$1"} />
      </Fab>
    </>
  );
};

const Letters = (props: { mode: "PUBLIC" | "PRIVATE" }) => {
  const [letters, setLetters] = useState<
    {
      id: string;
      title: string;
      body: string;
    }[]
  >([]);
  const [letter, setLetter] = useState<any>();
  const { user } = useContext(UserContext);
  const gridRef = useRef<Grid>();

  const getLetters = (skip: number) => {
    axiosInstance
      .get(`/letter?skip=${skip}&mode=${props.mode}`, {
        headers: { Authorization: "Bearer " + user?.token },
      })
      .then((data) => {
        if (data.data && data.data.length > 0) {
          if (skip < letters.length) {
            setLetters([...data.data]);
          } else setLetters([...letters, ...data.data]);
          gridRef.current?.updateLayout();
        }
      });
  };
  useEffect(() => {
    getLetters(0);

    return () => {
      setLetters([]);
    };
  }, []);

  return (
    <View display="flex" flex={1}>
      <ScrollView
        onScroll={(e) => {
          if (isCloseToBottom(e.nativeEvent)) {
            getLetters(letters.length);
          }
        }}
        flex={1}
        overflow="scroll"
        padding={16}
      >
        <StackGrid
          gridRef={(grid) => {
            gridRef.current = grid;
          }}
          rtl
          gutterHeight={16}
          gutterWidth={16}
          columnWidth={"40%"}
        >
          {letters?.map((item: any) => (
            <Pressable
              onPress={() => setLetter({ title: item.title, body: item.body })}
            >
              <Card gap={8} maxHeight={200} width={"$full"} key={item.id}>
                <Text fontFamily="Vazirmatn_700Bold">{item.title}</Text>
                <Divider />
                <Text
                  numberOfLines={4}
                  ellipsizeMode="tail"
                  fontFamily="Vazirmatn_400Regular"
                  fontSize={"$xs"}
                >
                  {item.body}
                </Text>
              </Card>
            </Pressable>
          ))}
        </StackGrid>
      </ScrollView>
      <AddLetter
        mode={props.mode}
        onCloseEvent={() => {
          getLetters(0);
        }}
      />
      <ReadLetterModal
        openReadLetter={letter}
        body={letter?.body}
        title={letter?.title}
        onClose={() => {
          setLetter(undefined);
        }}
      />
    </View>
  );
};

const GlobalLetters = () => {
  return <Letters mode="PUBLIC" />;
};

const PrivateLetters = () => {
  return <Letters mode="PRIVATE" />;
};

const renderScene = SceneMap({
  global: GlobalLetters,
  private: PrivateLetters,
});

export default function KaamNaamehPage() {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(1);
  const [routes] = useState([
    { key: "private", title: "دفترچه یادداشت" },
    { key: "global", title: "عمومی" },
  ]);

  return (
    <TabView
      lazy
      layoutDirection={"rtl"}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={{ backgroundColor: "transparent" }}
          indicatorStyle={{ backgroundColor: "#f7941d" }}
          labelStyle={{ color: "black", fontFamily: "Vazirmatn_700Bold" }}
        />
      )}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}
