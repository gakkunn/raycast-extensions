import { ActionPanel, Action, Icon, List, Toast, showToast, getPreferenceValues } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { getRecentProjects } from "./lib/history";
import { getLocalProjects } from "./lib/local";
import { openProjectInNewWindow } from "./lib/cli";

export default function Command() {
  const { projectRoots = "" } = getPreferenceValues<{
    projectRoots?: string;
  }>();

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

  const handleOpenNewWindow = async (projectPath: string) => {
    try {
      await openProjectInNewWindow(projectPath);
    } catch (error) {
      await showToast(Toast.Style.Failure, "Failed to open in a new window", String(error));
    }
  };

  return (
    <List isLoading={isLoadingRecent || isLoadingLocal} searchBarPlaceholder="Search projects...">
      <List.Section title="Recent Projects">
        {recentProjects?.map((projectPath) => (
          <ProjectListItem
            key={projectPath}
            path={projectPath}
            type="recent"
            onOpenNewWindow={() => handleOpenNewWindow(projectPath)}
          />
        ))}
      </List.Section>

      <List.Section title="Local Projects">
        {localProjects?.map((projectPath) => (
          <ProjectListItem
            key={projectPath}
            path={projectPath}
            type="local"
            onOpenNewWindow={() => handleOpenNewWindow(projectPath)}
          />
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
          <Action.Open title="Open in VS Code" target={path} application="Visual Studio Code" />
          <Action title="Open in New Window" onAction={onOpenNewWindow} icon={Icon.Window} />
          <Action.ShowInFinder path={path} />
          <Action.CopyToClipboard content={path} title="Copy Path" />
        </ActionPanel>
      }
    />
  );
}
