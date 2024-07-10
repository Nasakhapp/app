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

export default function ReadLetterModal({
  title,
  body,
  onClose,
  openReadLetter,
}: {
  title: string;
  body: string;
  onClose: () => void;
  openReadLetter: boolean;
}) {
  return (
    <Modal
      size="full"
      onClose={() => {
        onClose();
      }}
      isOpen={openReadLetter}
    >
      <ModalBackdrop />
      <ModalContent height={"100%"}>
        <ModalHeader direction="rtl">
          <Text fontFamily="Vazirmatn_700Bold" fontSize={"$xl"}>
            {title}
          </Text>
          <ModalCloseButton>
            <CloseIcon />
          </ModalCloseButton>
        </ModalHeader>
        <ModalBody contentContainerStyle={{ flex: 1 }} style={{ padding: 0 }}>
          <View mt={16} flex={1} display="flex" flexDirection="column" gap={8}>
            <View paddingHorizontal={16} flex={1} overflow="scroll">
              <Text fontSize={14} fontFamily="Vazirmatn_500Medium">
                {body}
              </Text>
            </View>
          </View>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
