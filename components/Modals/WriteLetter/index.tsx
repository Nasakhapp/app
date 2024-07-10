import { UserContext } from "@/components/Contexts/Contexts";
import axiosInstance from "@/lib/Instance";
import {
  Button,
  CloseIcon,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  View,
} from "@gluestack-ui/themed";
import { useContext, useState } from "react";

export default function WriteLetterModal({
  openWriteModal,
  setOpenWriteModal,
  onClose,
  mode,
}: {
  openWriteModal: boolean;
  setOpenWriteModal: (status: boolean) => void;
  onClose: () => void;
  mode: "PUBLIC" | "PRIVATE";
}) {
  const [title, setTitle] = useState<string>();
  const [body, setBody] = useState<string>();
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const { user } = useContext(UserContext);
  return (
    <Modal
      size="full"
      onClose={() => {
        setTitle("");
        setBody("");
        onClose();
      }}
      isOpen={openWriteModal}
    >
      <ModalBackdrop />
      <ModalContent height={"100%"}>
        <ModalHeader direction="rtl">
          <Text fontFamily="Vazirmatn_700Bold" fontSize={"$xl"}>
            بنویس تا خالی شی
          </Text>
          <ModalCloseButton>
            <CloseIcon />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody contentContainerStyle={{ flex: 1 }}>
          <View flex={1} display="flex" flexDirection="column" gap={8}>
            <View>
              <Text mb={4} fontSize={14} fontFamily="Vazirmatn_500Medium">
                عنوان
              </Text>
              <Input>
                <InputField
                  value={title}
                  onChangeText={(title) => setTitle(title)}
                  direction="rtl"
                  fontFamily="Vazirmatn_700Bold"
                  placeholder="یه قصه کوتاه..."
                />
              </Input>
            </View>
            <View flex={1}>
              <Text mb={4} fontSize={14} fontFamily="Vazirmatn_500Medium">
                متن
              </Text>
              <Input overflow="scroll" flex={1}>
                <InputField
                  value={body}
                  onChangeText={(body) => setBody(body)}
                  direction="rtl"
                  fontFamily="Vazirmatn_400Regular"
                  placeholder="شاید از اونجایی شروع شد که..."
                  multiline
                  overflow="scroll"
                  flex={1}
                  padding={8}
                />
              </Input>
            </View>
          </View>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={isSubmitting}
            w={"$full"}
            onPress={() => {
              if (title?.trim() && body?.trim()) {
                setSubmitting(true);
                axiosInstance
                  .post(
                    "/letter",
                    { body, title, mode },
                    { headers: { Authorization: "Bearer " + user?.token } }
                  )
                  .then(({ data }) => {
                    onClose();
                  })
                  .finally(() => {
                    setSubmitting(false);
                  });
              }
            }}
            backgroundColor="#f7941d"
          >
            <Text color="$white" fontFamily="Vazirmatn_500Medium">
              تامام
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
