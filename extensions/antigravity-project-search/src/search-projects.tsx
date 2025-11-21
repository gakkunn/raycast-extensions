import { List, ActionPanel, Action, getPreferenceValues, Icon, Toast, showToast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { getRecentProjects } from "./lib/history";
import { getLocalProjects } from "./lib/local";
import { openProjectInNewWindow } from "./lib/cli";

interface Preferences {
  projectRoots: string;
}

export default function Command() {
  const { projectRoots } = getPreferenceValues<Preferences>();

  const { data: recentProjects, isLoading: isLoadingRecent } = usePromise(getRecentProjects, [], {
    onError: (error) => {
      showToast(Toast.Style.Failure, "Failed to load recent projects", String(error));
    },
  });
  const { data: localProjects, isLoading: isLoadingLocal } = usePromise(getLocalProjects, [projectRoots], {
    onError: (error) => {
      showToast(Toast.Style.Failure, "Failed to load local projects", String(error));
    },
  });

  const handleOpenNewWindow = async (path: string) => {
    try {
      await openProjectInNewWindow(path);
    } catch (error) {
      await showToast(Toast.Style.Failure, "Failed to open in a new window", String(error));
    }
  };

  return (
    <List isLoading={isLoadingRecent || isLoadingLocal} searchBarPlaceholder="Search projects...">
      <List.Section title="Recent Projects">
        {recentProjects?.map((path) => (
          <ProjectListItem key={path} path={path} type="recent" onOpenNewWindow={() => handleOpenNewWindow(path)} />
        ))}
      </List.Section>

      <List.Section title="Local Projects">
        {localProjects?.map((path) => (
          <ProjectListItem key={path} path={path} type="local" onOpenNewWindow={() => handleOpenNewWindow(path)} />
        ))}
      </List.Section>
    </List>
  );
}

function ProjectListItem({
  path,
  type,
  onOpenNewWindow,
}: {
  path: string;
  type: "recent" | "local";
  onOpenNewWindow: () => void;
}) {
  const name = path.split("/").pop() || path;

  return (
    <List.Item
      title={name}
      subtitle={path}
      icon={type === "recent" ? Icon.Clock : Icon.Folder}
      actions={
        <ActionPanel>
          <Action.Open title="Open in Antigravity" target={path} application="Antigravity" />
          <Action title="Open in New Window" onAction={onOpenNewWindow} icon={Icon.Window} />
          <Action.ShowInFinder path={path} />
          <Action.CopyToClipboard content={path} title="Copy Path" />
        </ActionPanel>
      }
    />
  );
}
