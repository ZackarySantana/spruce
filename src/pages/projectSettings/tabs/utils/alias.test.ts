import {
  AliasFormType,
  AliasNames,
  GitTagSpecifier,
  transformAliases,
  VariantTaskSpecifier,
} from "./alias";

describe("transformAliases", () => {
  it("should return a list of aliases using an AliasName if provided", () => {
    expect(
      transformAliases(
        [
          {
            id: "123",
            variants: {
              specifier: VariantTaskSpecifier.Regex,
              variant: ".*",
              variantTags: ["hi"],
            },
            tasks: {
              specifier: VariantTaskSpecifier.Regex,
              task: ".*",
              taskTags: ["hello"],
            },
          } as AliasFormType,
        ],
        true,
        AliasNames.GithubPr
      )
    ).toStrictEqual([
      {
        id: "123",
        alias: "__github",
        variantTags: [],
        taskTags: [],
        variant: ".*",
        task: ".*",
        gitTag: "",
        remotePath: "",
      },
    ]);
  });

  it("should return an empty array if override is false", () => {
    expect(
      transformAliases(
        [
          {
            id: "123",
          } as AliasFormType,
        ],
        false,
        AliasNames.GithubPr
      )
    ).toStrictEqual([]);
  });

  it("should filter out empty tag entries", () => {
    expect(
      transformAliases(
        [
          {
            id: "456",
            variants: {
              specifier: VariantTaskSpecifier.Tags,
              variant: "something",
              variantTags: ["new", "", ""],
            },
            tasks: {
              specifier: VariantTaskSpecifier.Tags,
              task: "",
              taskTags: ["test"],
            },
          } as AliasFormType,
        ],
        true,
        AliasNames.CommitQueue
      )
    ).toStrictEqual([
      {
        id: "456",
        alias: "__commit_queue",
        variantTags: ["new"],
        taskTags: ["test"],
        variant: "",
        task: "",
        gitTag: "",
        remotePath: "",
      },
    ]);
  });

  it("uses a custom alias if one is provided", () => {
    expect(
      transformAliases(
        [
          {
            id: "",
            alias: "myAlias",
            variants: {
              specifier: VariantTaskSpecifier.Tags,
              variant: "",
              variantTags: ["hello"],
            },
            tasks: {
              specifier: VariantTaskSpecifier.Tags,
              task: "",
              taskTags: ["goodbye"],
            },
          } as AliasFormType,
        ],
        true
      )
    ).toStrictEqual([
      {
        id: "",
        alias: "myAlias",
        variantTags: ["hello"],
        taskTags: ["goodbye"],
        variant: "",
        task: "",
        gitTag: "",
        remotePath: "",
      },
    ]);
  });

  describe("git tag aliases", () => {
    it("correctly uses a config file", () => {
      expect(
        transformAliases(
          [
            {
              id: "",
              gitTag: "test",
              specifier: GitTagSpecifier.ConfigFile,
              remotePath: "evergreen.yml",
              variants: {
                specifier: VariantTaskSpecifier.Tags,
                variant: "",
                variantTags: ["hello"],
              },
              tasks: {
                specifier: VariantTaskSpecifier.Tags,
                task: "",
                taskTags: ["goodbye"],
              },
            } as AliasFormType,
          ],
          true,
          AliasNames.GitTag
        )
      ).toStrictEqual([
        {
          id: "",
          alias: "__git_tag",
          gitTag: "test",
          remotePath: "evergreen.yml",
          variantTags: [],
          taskTags: [],
          variant: "",
          task: "",
        },
      ]);
    });

    it("correctly uses a variant/task pair", () => {
      expect(
        transformAliases(
          [
            {
              id: "",
              gitTag: "test",
              specifier: GitTagSpecifier.VariantTask,
              remotePath: "evergreen.yml",
              variants: {
                specifier: VariantTaskSpecifier.Tags,
                variant: "",
                variantTags: ["hello"],
              },
              tasks: {
                specifier: VariantTaskSpecifier.Tags,
                task: "",
                taskTags: ["goodbye"],
              },
            } as AliasFormType,
          ],
          true,
          AliasNames.GitTag
        )
      ).toStrictEqual([
        {
          id: "",
          alias: "__git_tag",
          gitTag: "test",
          remotePath: "",
          variantTags: ["hello"],
          taskTags: ["goodbye"],
          variant: "",
          task: "",
        },
      ]);
    });
  });
});
