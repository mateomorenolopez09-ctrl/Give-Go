import React from 'react';
import { Modal, View, Text, TouchableWithoutFeedback, StyleProp, ViewStyle } from 'react-native';
import { modalStyles } from './AppModal.styles';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  contentStyle,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[modalStyles.content, contentStyle]}>
              {title ? <Text style={modalStyles.title}>{title}</Text> : null}
              {subtitle ? <Text style={modalStyles.subtitle}>{subtitle}</Text> : null}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AppModal;
