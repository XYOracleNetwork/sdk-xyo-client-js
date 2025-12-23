gen_enforced_dependency(Workspace, Dependency) :-
  workspace_has_dependency(Workspace, Dependency),
  not(workspace_declares_dependency(Workspace, Dependency)).