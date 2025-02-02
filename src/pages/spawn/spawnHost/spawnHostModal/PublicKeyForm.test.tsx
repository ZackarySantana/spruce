import { render, fireEvent, act } from "test_utils";
import { PublicKeyForm } from "./PublicKeyForm";

const publicKeys = [
  { key: "ssh key some long key name", name: "MyFirstKey.pub" },
  {
    key: "ssh second key with some long key name",
    name: "MySecondKey.pub",
  },
  {
    key: "ssh wow this key is very good totally secure",
    name: "MyThirdKey.pub",
  },
];

const emptyState = {
  publicKey: {
    name: "",
    key: "",
  },
  savePublicKey: false,
};

describe("publicKeyForm", () => {
  it("public Key state should be initialized correctly", () => {
    const defaultState = {
      publicKey: { ...publicKeys[0] },
      savePublicKey: false,
    };

    let data = { ...emptyState };
    const updateData = jest.fn((x) => {
      data = x;
    });

    render(
      <PublicKeyForm
        publicKeys={publicKeys}
        data={data}
        onChange={updateData}
      />
    );
    expect(data).toStrictEqual(defaultState);
  });

  it("selecting a public key from the dropdown should select it", async () => {
    let data = { ...emptyState };
    const updateData = jest.fn((x) => {
      data = x;
    });

    const { getByText, getByLabelText } = render(
      <PublicKeyForm
        publicKeys={publicKeys}
        data={data}
        onChange={updateData}
      />
    );
    fireEvent.click(getByLabelText("Existing Key"));

    const myKey = getByText("MySecondKey.pub");
    expect(myKey).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(myKey);
    });
    expect(data).toStrictEqual({
      publicKey: { ...publicKeys[1] },
      savePublicKey: false,
    });
  });

  it("clicking on Add new key should reset the state to the default", () => {
    const defaultState = {
      publicKey: { ...publicKeys[0] },
      savePublicKey: false,
    };
    let data = { ...emptyState };

    const updateData = jest.fn((x) => {
      data = x;
    });

    const { getByText, queryByLabelText } = render(
      <PublicKeyForm
        publicKeys={publicKeys}
        data={data}
        onChange={updateData}
      />
    );
    expect(queryByLabelText("Public Key")).toBeNull();
    expect(data).toStrictEqual(defaultState);

    fireEvent.click(getByText("Add new key"));
    expect(queryByLabelText("Public Key")).toBeInTheDocument();
    expect(data).toStrictEqual(emptyState);
  });

  it("textarea should not be visible when using existing key, select input should not be visible when adding new key", () => {
    const defaultState = {
      publicKey: { ...publicKeys[0] },
      savePublicKey: false,
    };
    let data = { ...emptyState };

    const updateData = jest.fn((x) => {
      data = x;
    });

    const { getByText, queryByLabelText } = render(
      <PublicKeyForm
        publicKeys={publicKeys}
        data={data}
        onChange={updateData}
      />
    );
    // Since 'Use Existing Key' is selected by default, the existing key select input should be visible.
    // The textarea should not be visible.
    expect(queryByLabelText("Public Key")).toBeNull();
    expect(queryByLabelText("Existing Key")).toBeInTheDocument();
    expect(data).toStrictEqual(defaultState);

    // If 'Add New Key' option is selected, the textarea should be visible, and the select input should
    // not be visible.
    fireEvent.click(getByText("Add new key"));
    expect(queryByLabelText("Public Key")).toBeInTheDocument();
    expect(queryByLabelText("Existing Key")).toBeNull();
    expect(data).toStrictEqual(emptyState);
  });

  it("textinput to specify new key name should be disabled until checkbox is checked", () => {
    let data = { ...emptyState };
    const updateData = jest.fn((x) => {
      data = x;
    });

    const { getByText, getByPlaceholderText } = render(
      <PublicKeyForm
        publicKeys={publicKeys}
        data={data}
        onChange={updateData}
      />
    );

    fireEvent.click(getByText("Add new key"));
    expect(getByPlaceholderText("Key name")).toHaveAttribute("disabled");
    fireEvent.click(getByText("Save public key"));
    expect(getByPlaceholderText("Key name")).toHaveAttribute("disabled", "");
  });
});
