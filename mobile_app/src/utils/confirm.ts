import { Alert } from "react-native";

export async function confirmDestructiveAction(
    title: string,
    message: string,
) {
    return await new Promise<boolean>((resolve) => {
        let settled = false;

        const finish = (value: boolean) => {
            if (settled) {
                return;
            }

            settled = true;
            resolve(value);
        };

        Alert.alert(title, message, [
            {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                    finish(false);
                },
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    finish(true);
                },
            },
        ]);
    });
}
